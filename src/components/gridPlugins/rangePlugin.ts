import {BasePlugin, h, type PluginProviders, type RangeArea, type VNode, type ColumnProp} from '@revolist/revogrid';

const RANGE_CLASS = 'tsm-range';

export type VVNode = {
  $children$: VVNode[];
  $tag$: string | null | number | Function;
  $text$: string | null;
} & Omit<VNode, '$children$' | '$tag$' | '$text$'>

export class RangePlugin extends BasePlugin {
  private correctedPosition: RangeArea | null = null;
  private hideSpread = false;
  private nodeToRender: VNode | null = null;

  constructor(tableElement: HTMLRevoGridElement, providers: PluginProviders) {
    super(tableElement, providers);
    tableElement.classList.add(RANGE_CLASS);

    // Allow only to edit single column
    this.addEventListener('beforerange', (e) => {
      let editingColumnProp: ColumnProp | null = null;

      if (this.correctedPosition) {
        e.detail.newRange = this.correctedPosition;

        Object.keys(e.detail.mapping).forEach(row => {
          const mappingData = e.detail.mapping[row as unknown as number];
          const newData = e.detail.newData[row as unknown as number];
          const mappedKeys = Object.keys(mappingData);

          if (!editingColumnProp) {
            editingColumnProp = mappingData[mappedKeys[0]].colProp;
          }

          mappedKeys.forEach(key => {
            if (key === editingColumnProp) {
              return;
            }

            delete mappingData[key];
            delete newData[key];
          });
        });
      }
    });

    this.addEventListener('settemprange', async (e) => {
      e.preventDefault();
      if (!e.detail?.area) {
        return;
      }

      const selectedRange = {...e.detail.area};
      this.correctedPosition = this.correctAutofillRange(selectedRange);
      e.detail.area = this.correctedPosition;
    });

    this.addEventListener('setrange', (e) => {
      if (!e.detail || !this.correctedPosition) {
        return;
      }

      const {x, y, x1, y1} = this.correctedPosition;
      e.detail.y = y;
      e.detail.y1 = y1;
      e.detail.x = x;
      e.detail.x1 = x1;

      this.correctedPosition = null;
    });

    this.addEventListener('beforecellfocus', (e: CustomEvent) => {
      this.hideSpread = !this.getEditableColumns().includes(e.detail.prop);
      this.renderStyles();
    });

    tableElement.registerVNode = [...tableElement.registerVNode, () => this.nodeToRender ?? h('span')];
  }

  private getEditableColumns(): Array<string> {
    if ('rangePluginEditableColumns' in this.revogrid) {
      const editableColumns = this.revogrid.rangePluginEditableColumns;
      if (!Array.isArray(editableColumns)) {
        throw new Error('rangePluginEditableColumns must be an array!');
      }

      return editableColumns;
    }
    return [];
  }

  private correctAutofillRange(obj: RangeArea): RangeArea {
    const range = {...obj};

    if (range.x1 !== range.x) {
      range.x1 = range.x;
    }

    return range;
  }

  get styles() {
    return `.${RANGE_CLASS} .autofill-handle { display: none; }`;
  }

  public renderStyles() {
    if (this.hideSpread) {
      const node: VVNode = {
        $children$: [
          {
            $children$: [],
            $elm$: null,
            $flags$: 0,
            $tag$: null,
            $text$: this.styles
          }
        ],
        $elm$: null,
        $flags$: 0,
        $tag$: 'style',
        $text$: null
      };
      this.nodeToRender = node as VNode;
    } else {
      this.nodeToRender = null;
    }
    this.revogrid.querySelector('revogr-extra')?.refresh();
  }
}
