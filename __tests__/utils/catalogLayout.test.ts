import { getCatalogItemLayout } from '@features/movies/utils/catalogLayout';

describe('getCatalogItemLayout', () => {
  it('treats the index as a ROW index (numColumns grid)', () => {
    const rowHeight = 280;
    const layout = getCatalogItemLayout(rowHeight);

    expect(layout(null, 0)).toEqual({ length: rowHeight, offset: 0, index: 0 });
    expect(layout(null, 1)).toEqual({
      length: rowHeight,
      offset: rowHeight,
      index: 1,
    });
    expect(layout(null, 3)).toEqual({
      length: rowHeight,
      offset: rowHeight * 3,
      index: 3,
    });
  });

  it('never halves the offset (regression: index is already the row)', () => {
    const rowHeight = 100;
    const layout = getCatalogItemLayout(rowHeight);
    const rows = 50;

    for (let row = 0; row < rows; row++) {
      expect(layout(null, row).offset).toBe(rowHeight * row);
    }
  });
});
