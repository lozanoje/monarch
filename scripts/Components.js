import Monarch from "./Monarch.js";

/**
 * @callback stringCallback
 * @param {Card}  card      - The card to construct the string for
 * @param {Cards} container - The cards container
 * @returns {string}
 *
 * @callback booleanCallback
 * @param {Card}  card      - The card to determine the boolean for
 * @param {Cards} container - The cards container
 * @returns {boolean}
 *
 * @callback clickCallback
 * @param {Event} event     - The click event
 * @param {Card}  card      - The card to act upon
 * @param {Cards} container - The cards container
 * @returns {void}
 */
/**
 * @typedef  {Object} CardBadge                     An object defining a badge to display information on a card.
 * @property {string|stringCallback}   tooltip    - The tooltip of the badge, or a function that returns the tooltip
 * @property {string|stringCallback}   text       - The label of the badge, or a function that returns the label. May contain HTML.
 * @property {string}                  [class]    - The css class to apply to the badge
 * @property {boolean|booleanCallback} [hide]     - Whether or not to hide (not display) the badge at all.

 * @typedef  {Object} CardMarker                    An object defining a marker to display on a card.
 * @property {string|stringCallback}   tooltip    - The tooltip of the marker, or a function that returns the tooltip
 * @property {string}                  [class]    - The css class to apply to the marker
 * @property {string|stringCallback}   [icon]     - The icon to display for the marker, or a function that returns the icon. Default is a dot.
 * @property {String|stringCallback}   [color]    - The color of the marker, or a function that returns the color. Default is white.
 * @property {boolean|booleanCallback} [show]     - Whether or not to show the marker. Default is false.
 *
 * @typedef  {Object} CardControl                   An object defining a control to display on a card.
 * @property {string|stringCallback}   [tooltip]  - The tooltip of the control, or a function that returns the tooltip
 * @property {string|stringCallback}   [aria]     - The aria label (for screen readers) of the control, or a function that returns the aria label
 * @property {string|stringCallback}   [icon]     - The icon to display for the control, or a function that returns the icon
 * @property {string}                  [class]    - The css class to apply to the control
 * @property {boolean|booleanCallback} [disabled] - Whether the control is disabled, or a function that returns whether the control is disabled
 * @property {clickCallback}           [onclick]  - The function to call when the control is clicked
 * @property {Array<CardControl>}      [controls] - An array of controls to display as a group
 *
 * @typedef  {Object} AppControl                    An object defining a control to display on the application.
 * @property {string}                  label      - The label of the control
 * @property {string|stringCallback}   tooltip    - The tooltip of the control, or a function that returns the tooltip
 * @property {string|stringCallback}   aria       - The aria label (for screen readers) of the control, or a function that returns the aria label
 * @property {string}                  class      - The css class to apply to the control
 * @property {string|stringCallback}   icon       - The icon to display for the control, or a function that returns the icon
 * @property {clickCallback}           onclick    - The function to call when the control is clicked
 */

export class Controls {
	/** @type {Array<CardControl>} */
	static get default() {
		return [
			this.faces
		];
	}

	/** @type {CardControl} */
	static get faces() {
		return {
			class: "card-faces",
				controls: [
					this.faceNext,
					this.facePrevious
				]
		}
	}

	/** @type {CardControl} */
	static get faceNext() {
		return {
			tooltip: "CARD.FaceNext",
			icon: "fas fa-caret-up",
			class: "next-face",
			disabled: (card) => !card.hasNextFace,
			onclick: (event, card) => card.update({ face: card.data.face === null ? 0 : card.data.face + 1 })
		}
	}

	/** @type {CardControl} */
	static get facePrevious() {
		return {
			tooltip: "CARD.FacePrevious",
			icon: "fas fa-caret-down",
			class: "prev-face",
			disabled: (card) => !card.hasPreviousFace,
			onclick: (event, card) => card.update({ face: card.data.face === 0 ? null : card.data.face - 1 })
		}
	}

	/** @type {CardControl} */
	static get play() {
		return {
			tooltip: "CARD.Play",
			aria: (card) => game.i18n.format("monarch.aria.playCard", { name: card.name }),
			icon: "fas fa-chevron-circle-right",
			class: "play-card",
			onclick: (event, card, pile) => pile.playDialog(card)
		}
	}

	/** @type {CardControl} */
	static get edit() {
		return {
			tooltip: "CARD.Edit",
			icon: "fas fa-edit",
			class: "edit-card",
			onclick: (event, card) => card.sheet.render(true)
		}
	}

	/** @type {CardControl} */
	static get delete() {
		return {
			tooltip: "CARD.Delete",
			icon: "fas fa-trash",
			class: "delete-card",
			onclick: (event, card) => card.deleteDialog()
		}
	}

	/** @type {CardControl} */
	static get discard() {
		return {
			tooltip: "monarch.label.discard",
			icon: "fas fa-caret-square-down",
			class: "discard-card",
			onclick: (event, card) => card.pass(Monarch.discardPile)
		}
	}
}

export class Badges {
	/** @type {Array<CardBadge>} */
	static get default() {
		return [
			this.suit,
			this.value,
			this.type,
		];
	}

	/** @type {CardBadge} */
	static get name() {
		return {
			tooltip: "CARD.Name",
			text: (card) => card.name,
			class: "card-name"
		}
	}

	/** @type {CardBadge} */
	static get suit() {
		return {
			tooltip: "CARD.Suit",
			text: card => card.data.suit,
			class: "card-suit"
		}
	}

	/** @type {CardBadge} */
	static get value() {
		return {
			tooltip: "CARD.Value",
			text: card => card.data.value,
			class: "card-value"
		}
	}

	/** @type {CardBadge} */
	static get type() {
		return {
			tooltip: "CARD.Type",
			text: card => card.data.type,
			class: "card-type"
		}
	}

	/** @type {CardBadge} */
	static get drawn() {
		return {
			tooltip: "CARD.Drawn",
			text: game.i18n.localize("CARD.Drawn"),
			hide: (card) => !card.data.drawn,
			class: "card-drawn"
		}
	}
}

export class Markers {
	/** @type {Array<CardMarker>} */
	static get default() {
		return [
			this.color.red,
			this.color.green,
			this.color.blue,
			this.color.yellow,
			this.color.purple,
			this.color.black,
			this.color.white
		];
	}

	/**
	 * Returns a marker definition for a colored dot.
	 *
	 * @param {string} color - The color of the dot
	 * @returns {CardMarker}
	 */
	static _getColorMarker(color) {
		return {
			tooltip: `monarch.markers.${color}`,
			class: `marker-${color}`,
			icon: "fas fa-circle",
			color: this._colors[color],
			show: (card) => card.data?.flags?.monarch?.markers[color],
		}
	}

	/** @type {Object<string, string>} */
	static _colors = {
		red: "#ff0000",
		green: "#00ff00",
		blue: "#0000ff",
		yellow: "#ffff00",
		purple: "#800080",
		black: "#000000",
		white: "#ffffff"
	}

	/** @type {Object<string, CardMarker>} */
	static get color() {
		return {
			get red()    { return Markers._getColorMarker("red"); },
			get green()  { return Markers._getColorMarker("green"); },
			get blue()   { return Markers._getColorMarker("blue"); },
			get yellow() { return Markers._getColorMarker("yellow"); },
			get purple() { return Markers._getColorMarker("purple"); },
			get black()  { return Markers._getColorMarker("black"); },
			get white()  { return Markers._getColorMarker("white"); },
		}
	}
}