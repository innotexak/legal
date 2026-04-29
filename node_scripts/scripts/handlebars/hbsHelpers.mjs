import globalVars from '../../helpers/globalVars.mjs';

export default {
	ifEquals: function(arg1, arg2, options) {
		return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
	},

	ifContains: function(arg1, ...args) {
		for (let i = 0; i < (args.length - 1); i++) {
			if (arg1 === args[i]) {
				return args[args.length - 1].fn(this);
			}
		}
		return args[args.length - 1].inverse(this);
	},

	compare: function(v1, operator, v2) {
		switch (operator) {
			case '==': return v1 === v2;
			case '===': return v1 === v2;
			case '!=': return v1 !== v2;
			case '!==': return v1 !== v2;
			case '<': return v1 < v2;
			case '<=': return v1 <= v2;
			case '>': return v1 > v2;
			case '>=': return v1 >= v2;
			case '&&': return v1 && v2;
			case '||': return v1 || v2;
			default: throw new Error('helper {{compare}}: invalid operator ' + operator);
		}
	},

	ifAny: function(...args) {
		for (let i = 0; i < (args.length - 1); i++) {
			if (args[i]) {
				return args[args.length - 1].fn(this);
			}
		}
		return args[args.length - 1].inverse(this);
	},

	isProduction: function() {
		return globalVars.mode === 'production';
	},

	isDevelopment: function() {
		return globalVars.mode === 'development';
	},

	getPath: function() {
		return globalVars.isMultilanguage ? globalVars.path : '';
	},

	isMultilanguage: function() {
		return globalVars.isMultilanguage;
	},

	increment: function(index) {
		return (parseInt(index) || 0) + 1;
	},
	formatText: function(text) {
		if (typeof text !== 'string') return text;
		return text.replace(/\\n|\n/g, '<br>');
	},
};
