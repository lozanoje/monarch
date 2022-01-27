import * as utils from "./utils.js";

/**
 * @typedef  {Object} CardBadge                     An object defining a badge to display information on a card.
 * @property {string|Function<string>}   tooltip    - The tooltip of the badge, or a function that returns the tooltip
 * @property {string|Function<string>}   text       - The label of the badge, or a function that returns the label. May contain HTML.
 * @property {string}                    class      - The css class to apply to the badge
 * @property {boolean|Function<boolean>} [hide]     - Whether or not to hide (not display) the badge at all.
 *
 * @typedef  {Object} CardControl                   An object defining a control to display on a card.
 * @property {string|Function<string>}   [tooltip]  - The tooltip of the control, or a function that returns the tooltip
 * @property {string|Function<string>}   [aria]     - The aria label (for screen readers) of the control, or a function that returns the aria label
 * @property {string|Function<string>}   [icon]     - The icon to display for the control, or a function that returns the icon
 * @property {string}                    [class]    - The css class to apply to the control
 * @property {boolean|Function<boolean>} [disabled] - Whether the control is disabled, or a function that returns whether the control is disabled
 * @property {Function}                  [onclick]  - The function to call when the control is clicked
 * @property {Array<CardControl>}        [controls] - An array of controls to display as a group
 *
 * @typedef  {Object} AppControl                    An object defining a control to display on the application.
 * @property {string}                    label      - The label of the control
 * @property {string|Function<string>}   tooltip    - The tooltip of the control, or a function that returns the tooltip
 * @property {string|Function<string>}   aria       - The aria label (for screen readers) of the control, or a function that returns the aria label
 * @property {string}                    class      - The css class to apply to the control
 * @property {string|Function<string>}   icon       - The icon to display for the control, or a function that returns the icon
 * @property {Function}                  onclick    - The function to call when the control is clicked
 */

/** 
 * @param {typeof DocumentSheet} Base
 * @returns {typeof DocumentSheet}
 * @mixin
 * @augments DocumentSheet
 */
const MonarchApplicationMixin = Base => class extends Base {
	/** @override */
	setPosition(...args) {
		const position = super.setPosition(...args);
		utils.storeWindowPosition(this.object.uuid, position);
		return position;
	}

	/** @override */
	async close(...args) {
		utils.removePositon(this.object.uuid);
		return await super.close(args);
	}

	/** @type {boolean} */
	get isMonarch() { return true; }


	/**
	 * Handle sorting a Card relative to other siblings within this document
	 *
	 * @override Duplicates the functionality of the base method, but sorts the card *after* the target.
	 *
	 * @param {Event} event     The drag drop event
	 * @param {Card} card       The card being dragged
	 * @private
	 */
	_onSortCard(event, card) {
		const li = event.target.closest("[data-card-id]");
		const target = this.object.cards.get(li.dataset.cardId);
		const siblings = this.object.cards.filter(c => c.id !== card.id);
		const updateData = SortingHelpers.performIntegerSort(card, { target, siblings, sortBefore: false }).map(u => {
			return { _id: u.target.id, sort: u.update.sort }
		});
		return this.object.updateEmbeddedDocuments("Card", updateData);
	}

	/** @type {number} The height of all cards in the hand */
	get cardHeight() { return game.settings.get("monarch", "cardHeight"); }


	/**
	 * Calculate the visual dimensions of a card, storing that
	 * data in the card object.
	 *
	 * If the card has an explicit width and height, these will be
	 * used in the calculation. Otherwise, the dimensions will be
	 * obtained from the image.
	 *
	 * The height will be set to a fixed value, and the width will
	 * be calculated to maintain the aspect ratio of the image.
	 *
	 * @param {object} card - The card data object
	 * @memberof MonarchApplicationMixin
	 */
	async _calcCardDimensions(card) {
		let width = card.data.width ?? 0;
		let height = card.data.height ?? 0;

		if (!width || !height) {
			if (!card.img) width = height = this.cardHeight;
			else ({ width, height } = await utils.getImageDimensions(card.img));
		}

		card.height = this.cardHeight;
		card.width = width * (this.cardHeight / height);
	}


	/**
	 * Creates a cssImage string on a card containing an
	 * appropriate CSS url() to reference the image.
	 *
	 * @param {object} card - The card data object
	 * @memberof MonarchApplicationMixin
	 */
	_getCssImageUrl(card) {
		const image = card.img;
		const prefix = (image.startsWith("/") ||  image.startsWith("http")) ? "" : "/";
		card.cssImage = `url('${prefix}${image}')`;
	}

	/**
	 * The name of this application for use in named hooks.
	 * @type {string}
	 * @static
	 * @memberof MonarchApplicationMixin
	 */
	static appName = "Application";

	/** @type {Array<CardControl>} */
	get controls() {
		return [
			{
				class: "card-faces",
				controls: [
					{
						tooltip: "CARD.FaceNext",
						icon: "fas fa-caret-up",
						class: "next-face",
						disabled: (card) => !card.hasNextFace,
						onclick: (event, card) => card.update({ face: card.data.face === null ? 0 : card.data.face + 1 })
					},
					{
						tooltip: "CARD.FacePrevious",
						icon: "fas fa-caret-down",
						class: "prev-face",
						disabled: (card) => !card.hasPreviousFace,
						onclick: (event, card) => card.update({ face: card.data.face === 0 ? null : card.data.face - 1 })
					}
				]
			}
		];
	}

	/** @type {Array<CardBadge>} */
	get badges() {
		return [
			{
				tooltip: "CARD.Suit",
				text: card => card.data.suit,
				class: "card-suit"
			},
			{
				tooltip: "CARD.Value",
				text: card => card.data.value,
				class: "card-value"
			},
			{
				tooltip: "CARD.Type",
				text: card => card.data.type,
				class: "card-type"
			}
		];
	}

	/** @type {Array<AppControl>} */
	get appControls() {
		return [];
	}

	
	/**
	 * Generate the data for controls on the provided card.
	 *
	 * @param {Card}               card     - The card to place the control on
	 * @param {Array<CardControl>} controls - The controls to generate
	 * @return {Array<CardControl>}
	 */
	applyCardControls(card, controls) {
		return controls.map(control => this.applyCardControl(card, control));
	}

	/**
	 * Generate the data for a control on the provided card.
	 *
	 * @param {Card}               card     - The card to place the control on
	 * @param {Array<CardControl>} controls - The controls to generate
	 * @return {Array<CardControl>}
	 */
	applyCardControl(card, control) {
		return {
			tooltip:  utils.functionOrString(control.tooltip, "")(card),
			aria:     utils.functionOrString(control.aria, "")(card),
			icon:     utils.functionOrString(control.icon, "")(card),
			class:    control.class ?? "",
			disabled: utils.functionOrString(control.disabled, false)(card),
			controls: control.controls ? this.applyCardControls(card, control.controls) : []
		}
	}

	/**
	 * Generate the data for controls on the provided card.
	 *
	 * @param {Card}             card   - The card to place the control on
	 * @param {Array<CardBadge>} badges - The controls to generate
	 * @return {Array<CardBadge>} 
	 */
	applyCardBadges(card, badges) {
		return badges.map(badge => ({
			tooltip: utils.functionOrString(badge.tooltip, "")(card),
			text:    utils.functionOrString(badge.text, "")(card),
			hide:	 utils.functionOrString(badge.hide, false)(card),
			class:   badge.class ?? "",
		}));
	}

	/**
	 * Reduce a nested array of controls into a flat object of control functions.
	 *
	 * @param {Array<[string, Function]>} controls - Entries for each control function and its class
	 * @param {CardControl}               control  - The control to extract the function from                    
	 * @return {Array<[string, Function]>} Entries for each control function and its class
	 */
	controlReducer(controls, control) {
		if (control.onclick && control.class) {
			controls.push([control.class, control.onclick]);
		}

		if (control.controls) control.controls.reduce(this.controlReducer.bind(this), controls);

		return controls;
	}

	async getData(...args) {
		const data = await super.getData(...args);

		data.controls    = this.controls;
		data.badges      = this.badges;
		data.appControls = this.appControls;

		/**
		 * A hook that is called before this application is rendered which collects,
		 * a set of badges and controls to display on the application.
		 *
		 * @param {MonarchApplicationMixin} app          - The application object
		 * @param {Array<CardBadge>}        badges       - The badges to display for each card
		 * @param {Array<CardControl>}      controls     - The controls to display for each card
		 * @param {Array<AppControl>}       appControls  - The controls to display on the application
		 */
		Hooks.callAll(`getMonarch${this.constructor.appName}Controls`, this, data.controls, data.badges, data.appControls);

		/**
		 * All the callback functions from the controls mapped to their class names.
		 *
		 * @type {Object<string, Function>}
		 */
		this._controlFns = Object.fromEntries(data.controls.reduce(this.controlReducer.bind(this), []));

	//	this._controls    = data.controls;
	//	this._badges      = data.badges;
	//	this._appControls = data.appControls;

		return data;
	}
}

export default MonarchApplicationMixin;