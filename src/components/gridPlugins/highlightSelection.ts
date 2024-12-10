import {BasePlugin, type PluginProviders, type DimensionCols, type ColumnRegular, type CellProps} from '@revolist/revogrid';
import {classObjectFromClassProp} from './helpers.ts';

export const SELECTED_BG = 'highlight-row-bg';

// TODO: Refactor this plugin to add checkbox column and keep selectedRows here
export class HighlightSelection extends BasePlugin {
  constructor(tableElement: HTMLRevoGridElement, providers: PluginProviders) {
    super(tableElement, providers);

    this.addEventListener('beforecolumnsset', this.onBeforeColumnSet.bind(this));
  }

  public onBeforeColumnSet(e: Event) {
    const {detail} = e as CustomEvent<{ columns: Record<DimensionCols, ColumnRegular[]> }>;

    Object.values(detail.columns).forEach(columnsArray => {
      columnsArray.forEach(column => {
        const {columnProperties, cellProperties, cellTemplate} = column;

        column.cellProperties = (...args) => {
          const selectedUrls = this.getSelectedUrls();
          if (selectedUrls === null) {
            return;
          }

          const {model, prop} = args[0];
          const url: string = model.url;
          const columnProps = cellProperties?.(...args) || {};
          let {class: cls} = columnProps;
          cls = classObjectFromClassProp(cls);

          const isSelected = selectedUrls.has(url);

          cls = {
            ...(
              isSelected
                ? {[SELECTED_BG]: true}
                : {}
            ),
            ...cls,
          };

          return {
              ...columnProps,
              class: cls,
          } as CellProps;
        };
      });
    });
  }

  private getSelectedUrls(): Set<string> | null {
    if ('selectedUrls' in this.revogrid) {
      const editableColumns = this.revogrid.selectedUrls;
      if (!(editableColumns instanceof Set)) {
        throw new Error('selectedUrls is not found');
      }

      return editableColumns;
    }
    return null;
  }
}
