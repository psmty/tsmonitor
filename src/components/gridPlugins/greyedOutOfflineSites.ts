import {
  BasePlugin,
  type CellProps,
  type ColumnRegular,
  type DimensionCols,
  type PluginProviders
} from '@revolist/revogrid';
import {classObjectFromClassProp} from './helpers.ts';

const OFFLINE_CLS = 'offline-row-bg'

export class GreyedOutOfflineSites extends BasePlugin {
  constructor(tableElement: HTMLRevoGridElement, providers: PluginProviders) {
    super(tableElement, providers);

    this.addEventListener('beforecolumnsset', this.onBeforeColumnSet.bind(this));
  }

  public onBeforeColumnSet(e: Event) {
    const {detail} = e as CustomEvent<{ columns: Record<DimensionCols, ColumnRegular[]> }>;

    Object.values(detail.columns).forEach(columnsArray => {
      columnsArray.forEach(column => {
        const {cellProperties} = column;

        column.cellProperties = (...args) => {
          const {model, prop} = args[0];
          const online: boolean = model.online;
          const columnProps = cellProperties?.(...args) || {};
          let {class: cls} = columnProps;
          cls = classObjectFromClassProp(cls);

          cls = {
            ...(
              !online
                ? {[OFFLINE_CLS]: true}
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
}
