export class RenderOrderManager {
  static BASE_ORDER = 1;
  static STEP = 1;

  #orders = new Set<number>();

  /**
   * 获取排序
   * @returns order 排序值
   */
  get(): number {
    // 找到第一个空缺的排序
    for (
      let i = RenderOrderManager.BASE_ORDER;
      ;
      i += RenderOrderManager.STEP
    ) {
      if (!this.#orders.has(i)) {
        this.#orders.add(i);
        return i;
      }
    }
  }

  /**
   * 删除排序
   * @param order 顺序
   */
  delete(order: number) {
    this.#orders.delete(order);
  }
}

const renderOrderer = new RenderOrderManager();
export default renderOrderer;
