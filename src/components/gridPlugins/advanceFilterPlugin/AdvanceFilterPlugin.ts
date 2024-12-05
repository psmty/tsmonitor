import './filter.style.scss';

import {
  h,
  FilterPlugin,
  type PluginProviders,
  type ColumnRegular,
  type ColumnProp,
  type MultiFilterItem,
  isFilterBtn,
} from '@revolist/revogrid';
import { renderList } from './list.render';
import { notContains } from './contains';

const FIlTER_MINI: any = 'filterMini';

export class AdvanceFilterPlugin extends FilterPlugin {
  private miniFilter?: HTMLElement;
  constructor(
    revogrid: HTMLRevoGridElement,
    public providers: PluginProviders,
  ) {
    super(revogrid, providers);
    this.initConfig({
      customFilters: {
        [FIlTER_MINI]: {
          columnFilterType: FIlTER_MINI,
          name: FIlTER_MINI,
          func: notContains as any,
        },
      },
    });

    this.addEventListener('beforeheaderrender', (e: CustomEvent<HTMLRevogrHeaderElementEventMap['beforeheaderrender']>) => {
      if (e.detail.data.filter) {
        e.detail.canFilter = true;
      }
    });
  }

  extraContent(): any {
    return h(
      'div',
      {
        class: { filter: true },
        slot: 'header',
      },
      [
        'Select values' as any,
        h('div', {
          ref: (el?: HTMLElement) => (this.miniFilter = el ?? undefined),
        }),
      ],
    );
  }

  onFilterReset(prop?: ColumnProp) {
    super.onFilterReset(prop);
    if (this.miniFilter && typeof prop !== 'undefined') {
      this.miniFilterUpdate(prop);
    }
  }

  miniFilterUpdate(prop: ColumnProp) {
    if (this.miniFilter) {
      let currentMiniFilter = this.multiFilterItems[prop]?.find((f) => f.type === FIlTER_MINI);
      renderList(
        this.miniFilter,
        prop,
        this.providers.data.stores,
        currentMiniFilter?.value,
        (excluded) => {
          const filters = (this.multiFilterItems[prop] =
            this.multiFilterItems[prop] ?? []);
          if (!currentMiniFilter) {
            currentMiniFilter = {
              id: filters.length,
              type: FIlTER_MINI,
              value: excluded,
              relation: 'and',
              hidden: true,
            };
            filters.push(currentMiniFilter);
          } else {
            currentMiniFilter.value = excluded;
          }
          this.onFilterChange(this.multiFilterItems);
        },
      );
    }
  }

  async headerclick(e: CustomEvent<ColumnRegular>) {
    const el = e.detail.originalEvent?.target as HTMLElement;
    if (el && isFilterBtn(el)) {
      this.miniFilterUpdate(e.detail.prop);
    }
    super.headerclick(e);
  }

  getJSON() {
    const tempMultiFilters: MultiFilterItem = {};

    for (const key in this.multiFilterItems) {
        if (Object.prototype.hasOwnProperty.call(this.multiFilterItems, key)) {
            const entries = this.multiFilterItems[key];

            tempMultiFilters[key] = entries.map(entry => {
                if (entry.value instanceof Set) {
                    // Return a new object with the value converted to an array
                    return { ...entry, value: Array.from(entry.value) };
                }
                // Return the entry unchanged if value is not a Set
                return { ...entry };
            });
        }
    }

    return JSON.stringify(tempMultiFilters);
  }

  parseJSON(config: string): MultiFilterItem {
    const newData: MultiFilterItem = JSON.parse(config);

    for (const key in newData) {
        if (Object.prototype.hasOwnProperty.call(newData, key)) {
            const entries = newData[key];

            newData[key] = entries.map(entry => {
                if (entry.type === FIlTER_MINI && Array.isArray(entry.value)) {
                    // Return a new object with the value converted to a Set
                    return { ...entry, value: new Set(entry.value) };
                }
                // Return the entry unchanged if conditions are not met
                return { ...entry };
            });
        }
    }

    return newData;
  }
}
