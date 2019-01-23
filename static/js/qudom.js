/* Defines super-lightweight DOM and SVG element creation methods, including
   a quick DOM markup parser for compact HTML instantiation.
*/

define(function (require, exports, module) {
	function create(tag, attrs, html) {
		/* Quick functional way to create an HTML DOM element of the given tag
		   name with the given element attributes. Optionally, text content can
		   be provided as the third argument, but this will be appended first
		   to ensure proper transcription of any HTML encoding or elements it
		   contains.
		*/
		var element = document.createElement(tag);
		if (typeof (attrs) == 'undefined') { attrs = {}; }
		if (typeof (html) == 'undefined') { html = ''; }
		element.innerHTML = html;
		Object.keys(attrs).forEach(function (key) {
			element.setAttribute(key, attrs[key]);
		});
		return element;
	}

	function qudom_parse(identifier) {
		/* Generates a single DOM element with the ID, classes, and style
		   attributes specified by the given identifier. Leading with the
		   element tag, this can be augmented by:
		   * An ID starting with "#"
		   * Classes starting with "."
		   * Attributes starting with "@"
		   * Styles starting with "$"
		   * HTML content starting with "!"
		   
		   For example, the following identifier will generate a <div/> element
		   with the ID "myId", classes "classOne" and "classTwo", element
		   attributes "border=0" and "autofocus", and style attributes
		   "width:100px;" and "background-color:rgb(255,255,255)":
		      "div#myId.classOne.classTwo@border:0@autofocus$width:100px$background-color:rgb(255,255,255)"
		   
		   Note that, since ID begins with "#", color style values should use
		   RGB or other color formats that aren't hex values ("#fff", etc.).
		   There can also be issues with style values that include decimal
		   points. A better parser might be in order, in the long run.
		   
		   HTML content (all text following "!") should come last to avoid
		   unnecessary parsing errors triggered by overlap of HTML content with
		   other QuDom parsing symbols. Once the parser encounters a "!", all
		   subsequent text is placed into the HTML content of the element.
		*/
		var tag = 'div'; // defaults to <div/>
		var id = '';
		var classes = [];
		var attributes = {};
		var styles = {};
		var pattern = RegExp("[#\.@$!]");
		var html = "";
		while (identifier.length > 0) {
			if (identifier[0] == '#') {
				identifier = identifier.substr(1, identifier.length - 1);
				var parts = identifier.split(pattern);
				id = parts[0];
				identifier = identifier.substr(id.length, identifier.length - id.length);
			} else if (identifier[0] == ".") {
				identifier = identifier.substr(1, identifier.length - 1);
				var parts = identifier.split(pattern);
				var cls = parts[0];
				classes.push(cls);
				identifier = identifier.substr(cls.length, identifier.length - cls.length);
			} else if (identifier[0] == "@") {
				identifier = identifier.substr(1, identifier.length - 1);
				var parts = identifier.split(pattern);
				var attr = parts[0];
				var attrs = attr.split(":");
				if (attrs.length == 1) {
					attributes[attrs[0]] = true;
				} else {
					attributes[attrs[0]] = attrs[1];
				}
				identifier = identifier.substr(attr.length, identifier.length - attr.length);
			} else if (identifier[0] == "$") {
				identifier = identifier.substr(1, identifier.length - 1);
				var parts = identifier.split(pattern);
				var sty = parts[0];
				var stys = sty.split(":");
				if (stys.length == 1) {
					styles[stys[0]] = true;
				} else {
					styles[stys[0]] = stys[1];
				}
				identifier = identifier.substr(sty.length, identifier.length - sty.length);
			} else if (identifier[0] == "!") {
				html = identifier.substr(1, identifier.length - 1);
				identifier = "";
			} else {
				var parts = identifier.split(pattern);
				tag = parts[0];
				identifier = identifier.substr(tag.length, identifier.length - tag.length);
			}
		}
		return {
			tag: tag,
			id: id,
			classes: classes,
			attributes: attributes,
			styles: styles,
			html: html
		};
	}

	function qudom_factory(properties) {
		/* Uses the results of a *qudom_parse* invocation to generate the actual
		   DOM element with all the appropriate properties.
		*/
		var html = properties.html;
		delete properties.html;
		var styles = [];
		Object.keys(properties.styles).forEach(function (key) {
			styles.push(key + ":" + properties.styles[key]);
		});
		properties.attributes.class = properties.classes.join(' ');
		properties.attributes.style = styles.join(';');
		properties.attributes.id = properties.id;
		return create(properties.tag, properties.attributes, html);
	}

	function stylize(styles) {
		/* Converts an Object of style attributes (string key => string value)
		   to a single CSS-attribute-style string for assignment, using ":" and
		   ";" delimiters.
		*/
		var list = [];
		Object.keys(styles).forEach(function (key) {
			list.push(key + ":" + styles[key]);
		});
		return list.join(';');
	}

	function qudom(tree) {
		/* Uses a lightweight DOM markup to generate and return a DOM tree with
		   ID and class attributes. Each entry in the tree consists of a QuDom
		   identifier as a key, and an array of child entries (either subobjects
		   or string identifiers) as the value. Function returns a single DOM
		   element object, which means the top level can only contain one value.
		   To recurse to both possible types of child elements, tree can also be
		   a flat identifier (no children), in which case you might as well just
		   be calling the parser+factory.
		*/
		if (typeof (tree) == 'string') {
			var properties = qudom_parse(tree);
			return qudom_factory(properties);
		}
		var keys = Object.keys(tree);
		if (keys.length > 1) {
			console.warn("Ignoring all but the first entry in the QuDom tree");
		}
		var identifier = keys[0];
		var properties = qudom_parse(identifier);
		var parent = qudom_factory(properties);
		var children = [];
		tree[keys[0]].forEach(function (child) {
			var child = qudom(child); // Could be a flat string, or a subtree
			parent.appendChild(child);
		});
		return parent;
	}

	function svg(tag, attrs) {
		var svgNsUrl = 'http://www.w3.org/2000/svg';
		var element = document.createElementNS(svgNsUrl, tag);
		if (typeof (attrs) == 'undefined') { attrs = {}; }
		Object.keys(attrs).forEach(function (key) {
			element.setAttribute(key, attrs[key]);
		});
		return element;
	}

	function get(identifier) {
		if (identifier[0] == '#') {
			var id = identifier.substring(1, identifier.length);
			return document.getElementById(id);
		} else if (identifier[0] == '.') {
			var cls = identifier.substring(1, identifier.length);
			return document.getElementsByClassName(cls);
		} else {
			return document.getElementsByTagName(identifier);
		}
	}

	function clr(element) {
		while (element.childElementCount > 0) {
			element.removeChild(element.children[0]);
		}
	}

	function table(header, rows) {
		if (typeof (rows) == 'undefined') {
			rows = header;
			header = null;
		}
		var table = create('table');
		if (header != null) {
			var thead = create('thead');
			var tr = create('tr');
			header.forEach(function (h) {
				var th = create('th');
				th.textContent = String(h);
				tr.appendChild(th);
			});
			thead.appendChild(tr);
			table.appendChild(thead);
		}
		var tbody = create('tbody');
		rows.forEach(function (row, i) {
			var tr = create('tr');
			tr.setAttribute("class", "tr" + i);
			row.forEach(function (v, j) {
				var td = create('td');
				td.setAttribute("class", "td" + j);
				td.textContent = String(v);
				tr.appendChild(td);
			});
			tbody.appendChild(tr);
		});
		table.appendChild(tbody);
		return table;
	}

	function getStyles(element) {
		var style = element.getAttribute('style');
		if (style == null) { style = ''; }
		var parts = style.split(';');
		var styles = {}, key, value;
		parts.forEach(function (part) {
			if (part.length > 0) {
				[key, value] = part.split(':');
				styles[key] = value;
			}
		});
		return styles;
	}

	function setStyles(element, styles) {
		var style = [];
		var styles = Object.assign(getStyles(element), styles);
		Object.keys(styles).forEach(function (key) {
			style.push(key + ':' + styles[key]);
		});
		element.setAttribute('style', style.join(';'));
	}

	function addClass(element, cls) {
		var classes = element.getAttribute("class").split(" ");
		if (classes.indexOf(cls) < 0) {
			classes.push(cls);
		}
		element.setAttribute("class", classes.join(" "));
	}

	function removeClass(element, cls) {
		var classes = element.getAttribute("class").split(" ");
		if (classes.indexOf(cls) >= 0) {
			classes.splice(classes.indexOf(cls), 1);
		}
		element.setAttribute("class", classes.join(" "));
	}

	return {
		create: create,
		qudom: qudom,
		svg: svg,
		get: get,
		clr: clr,
		table: table,
		styles: {
			get: getStyles,
			set: setStyles
		},
		classes: {
			add: addClass,
			remove: removeClass
		},
		stylize: stylize
	};
});
