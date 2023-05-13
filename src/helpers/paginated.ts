export class Paginated<T> {
  public pagesCount: number;
  public page: number;
  public pageSize: number;
  public totalCount: number;
  public items: T;

  static getPaginated<T>(data: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    items: T;
  }): Paginated<T> {
    return {
      pagesCount: Math.ceil(data.totalCount / +data.pageSize),
      page: +data.pageNumber,
      pageSize: +data.pageSize,
      totalCount: +data.totalCount,
      items: data.items,
    };
  }
}
