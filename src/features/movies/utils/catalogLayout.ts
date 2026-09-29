export interface CatalogItemLayout {
  length: number;
  offset: number;
  index: number;
}

/**
 * `getItemLayout` for a `numColumns` grid.
 *
 * With `numColumns > 1`, FlatList passes the item index to VirtualizedList as
 * a **row** index (its `getItemCount` returns `ceil(data.length / numColumns)`)
 * and forwards `getItemLayout` unchanged. So `index` here is already the row.
 */
export const getCatalogItemLayout =
  (rowHeight: number) =>
  (
    _data: ArrayLike<unknown> | null | undefined,
    index: number
  ): CatalogItemLayout => ({
    length: rowHeight,
    offset: rowHeight * index,
    index,
  });
