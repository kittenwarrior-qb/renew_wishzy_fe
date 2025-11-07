module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded strings that should be translated',
      category: 'Internationalization',
      recommended: true,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          allowedStrings: {
            type: 'array',
            items: { type: 'string' }
          },
          ignoreAttributes: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        additionalProperties: false
      }
    ]
  },

  create(context) {
    const options = context.options[0] || {};
    const allowedStrings = new Set(options.allowedStrings || [
      // Technical strings that don't need translation
      'utf-8', 'application/json', 'text/html', 'image/png',
      // Single characters and symbols
      '/', '?', '&', '=', '#', '@', '+', '-', '*', '%',
      // Numbers as strings
      /^\d+$/,
      // CSS classes and IDs
      /^[a-z-]+$/i,
      // URLs and paths
      /^(https?:\/\/|\/)/,
      // Environment variables
      /^[A-Z_]+$/,
      // File extensions
      /^\.[a-z]+$/i
    ]);

    const ignoreAttributes = new Set(options.ignoreAttributes || [
      'className', 'id', 'key', 'data-testid', 'aria-label', 'role',
      'type', 'name', 'value', 'placeholder', 'alt', 'src', 'href'
    ]);

    function isAllowedString(str) {
      if (allowedStrings.has(str)) return true;
      
      for (const pattern of allowedStrings) {
        if (pattern instanceof RegExp && pattern.test(str)) {
          return true;
        }
      }
      
      return false;
    }

    function checkStringLiteral(node) {
      const value = node.value;
      
      // Skip empty strings
      if (!value || value.trim() === '') return;
      
      // Skip allowed strings
      if (isAllowedString(value)) return;
      
      // Skip if parent is an ignored attribute
      const parent = node.parent;
      if (parent && parent.type === 'JSXAttribute' && 
          ignoreAttributes.has(parent.name.name)) {
        return;
      }
      
      // Skip if it's a translation key (contains dots)
      if (typeof value === 'string' && value.includes('.')) return;
      
      // Skip if it's inside a translation function call
      let current = parent;
      while (current) {
        if (current.type === 'CallExpression' && 
            current.callee && 
            (current.callee.name === 't' || 
             (current.callee.property && current.callee.property.name === 't'))) {
          return;
        }
        current = current.parent;
      }

      context.report({
        node,
        message: `Hardcoded string "${value}" should be translated using t() function`,
      });
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string') {
          checkStringLiteral(node);
        }
      },
      
      TemplateLiteral(node) {
        // Check template literals for hardcoded strings
        node.quasis.forEach(quasi => {
          if (quasi.value.raw.trim()) {
            checkStringLiteral({
              ...quasi,
              value: quasi.value.raw
            });
          }
        });
      }
    };
  }
};
