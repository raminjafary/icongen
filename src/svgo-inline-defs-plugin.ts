import type { XastElement, XastParent, XastRoot, XastChild } from 'svgo';

const visitElements = (
  node: XastElement,
  fn: (node: XastElement, parentNode: XastParent) => void,
) => {
  if (node.children) {
    for (const child of node.children) {
      if (child.type === 'element') {
        fn(child, node);
        visitElements(child, fn);
      }
    }
  }
};

const fn = (root: XastRoot, params: { onlyUnique?: boolean }) => {
  const { onlyUnique = true } = params;

  const uses: [XastElement, XastParent][] = [];
  const useCounts = new Map<string, number>();
  const referencedElements = new Map<string, XastElement>();

  visitElements(
    root.children[0] as XastElement,
    (node: XastElement, parentNode: XastParent) => {
      if (node.name === 'use') {
        uses.push([node, parentNode]);
        const href = node.attributes['xlink:href'] || node.attributes.href;
        if (href) {
          const count = useCounts.get(href) || 0;
          useCounts.set(href, count + 1);
        }
      }
    },
  );

  return {
    element: {
      enter: (node: XastElement, parentNode: XastParent) => {
        if (node.attributes.id == null) {
          return;
        }
        const href = `#${node.attributes.id}`;
        const count = useCounts.get(href);

        if (count == null) {
          return;
        }
        referencedElements.set(href, node);

        if (onlyUnique === false && count > 1) {
          delete node.attributes.id;
        }

        if (onlyUnique === true && count === 1) {
          parentNode.children = parentNode.children.filter(
            (child: XastChild) => child !== node,
          );
        }
      },

      exit(node: XastElement, parentNode: XastParent) {
        if (node.name === 'defs') {
          if (onlyUnique === false || node.children.length === 0) {
            parentNode.children = parentNode.children.filter(
              (child: XastChild) => child !== node,
            );
          }
        }
      },
    },

    root: {
      exit: () => {
        for (const [use, useParentNode] of uses) {
          const href = use.attributes['xlink:href'] || use.attributes.href;
          if (!href) continue;

          const count = useCounts.get(href) || 0;
          const referenced = referencedElements.get(href);

          if (onlyUnique === true && count > 1) {
            continue;
          }
          if (referenced == null) {
            continue;
          }

          for (const [name, value] of Object.entries(use.attributes)) {
            if (
              name !== 'x' &&
              name !== 'y' &&
              name !== 'xlink:href' &&
              name !== 'href'
            ) {
              referenced.attributes[name] = value;
            }
          }

          const x = use.attributes.x;
          const y = use.attributes.y;
          let attrValue: string | null = null;
          if (x != null && y != null) {
            attrValue = `translate(${x}, ${y})`;
          } else if (x != null) {
            attrValue = `translate(${x})`;
          }

          let replacement = referenced;

          if (attrValue != null) {
            const g = {
              type: 'element',
              name: 'g',
              attributes: {
                transform: attrValue,
              },
              children: [referenced],
            };
            replacement = g as XastElement;
          }
          useParentNode.children = useParentNode.children.map(
            (child: XastChild) => {
              if (child === use) {
                return replacement;
              } else {
                return child;
              }
            },
          );
        }
      },
    },
  };
};

export default {
  name: 'inlineDefs',
  type: 'visitor',
  active: true,
  description: 'inlines svg definitions',
  params: { onlyUnique: false },
  fn,
};
