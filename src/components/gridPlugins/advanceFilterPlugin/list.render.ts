import type {
  DataStore,
  DataType,
  DimensionRows,
  ColumnProp,
} from "@revolist/revogrid";
type RowDataSources = {
  [T in DimensionRows]: DataStore<DataType, DimensionRows>;
};

const CHECKBOX_TAILWIND_CLASSES =
  "w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600";

function renderSearch({
  search,
  selectAll,
}: {
  search: (txt: string) => void;
  selectAll: (checked: boolean) => void;
}) {
  const wr = document.createElement("div");
  wr.classList.add("search-input");
  const input = document.createElement("input");
  input.classList.add("search-field");
  input.onkeydown = (e) => {
    e.stopPropagation();
  }; // keep event local, don't escalate farther to dom
  input.oninput = () => search(input.value.trim());
  const selectAllCheck = document.createElement("input");
  selectAllCheck.type = "checkbox";
  selectAllCheck.className = CHECKBOX_TAILWIND_CLASSES;
  selectAllCheck.onchange = () => {
    selectAll(selectAllCheck.checked);
  };
  wr.appendChild(selectAllCheck);
  wr.appendChild(input);
  return wr;
}

export function renderList(
  miniFilter: HTMLElement,
  columnProp: ColumnProp,
  dataProvider: RowDataSources,
  exlude = new Set<string>(),
  filter: (excluded: Set<any>) => void,
) {
  const columnData = new Map<
    string,
    { el: HTMLElement; input: HTMLInputElement }
  >();
  let filteredData = columnData;

  const filterList = document.createElement("ul");
  filterList.classList.add("filter-list");
  const updateFilter = () => {
    filterList.innerHTML = "";
    filterList.append(...[...filteredData.values()].map((v) => v.el));
  };

  miniFilter.innerHTML = "";
  miniFilter.appendChild(
    renderSearch({
      search(text) {
        filteredData = new Map();
        columnData.forEach((value, key) => {
          if (key.includes(text)) {
            filteredData.set(key, value);
          }
        });
        updateFilter();
      },
      selectAll(checked) {
        columnData.forEach((data, key) => {
          data.input.checked = checked;
          checked ? exlude.delete(key) : exlude.add(key);
        });
        filter(exlude);
      },
    }),
  );
  miniFilter.appendChild(filterList);

  const values = new Map<string, { value: string; label: string }>();
  Object.entries(dataProvider).forEach(([_type, storeService]) => {
    storeService.store.get("source").forEach((item) => {
      let originalValue = item[columnProp]?.toString().trim();
      let value = originalValue?.toLowerCase();
      if (!value) {
        value = "";
        originalValue = "Empty";
      }
      values.set(value, {
        value,
        label: originalValue,
      });
    });
  });
  [...values.values()]
    .sort((a, b) => b.value.localeCompare(a.value))
    .forEach(({ value, label: lbl }) => {
      // Create the label element
      const label = document.createElement("label");
      label.htmlFor = value;

      // Create the input element
      const input = document.createElement("input");
      input.type = "checkbox";
      input.className = CHECKBOX_TAILWIND_CLASSES;
      input.id = value;
      input.checked = !exlude.has(value);
      input.onchange = () => {
        if (!input.checked) {
          exlude.add(value);
        } else {
          exlude.delete(value);
        }
        filter(exlude);
      };

      // Append the input element and text node to the label element
      label.appendChild(input);
      label.appendChild(document.createTextNode(lbl));
      columnData.set(value, {
        el: label,
        input,
      });
    });

  updateFilter();
  return columnData;
}
