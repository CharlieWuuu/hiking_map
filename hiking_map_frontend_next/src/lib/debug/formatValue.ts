/**
 * 直接把 props 丟給 JSON.stringify 會炸：children 是 React element（結構龐大且有循環參照）、
 * 事件處理器是函式（會被靜默丟掉，看起來像不存在）。這裡先整理成看得懂的形狀。
 */
export function formatValue(value: unknown): string {
  const seen = new WeakSet<object>();

  const replacer = (key: string, inner: unknown): unknown => {
    if (key === 'children') return '‹children›';
    if (typeof inner === 'function') return `ƒ ${inner.name || 'anonymous'}()`;
    if (typeof inner === 'symbol') return inner.toString();
    if (inner instanceof Date) return inner.toISOString();
    if (inner instanceof Element) return `‹${inner.tagName.toLowerCase()}›`;

    if (typeof inner === 'object' && inner !== null) {
      if ('$$typeof' in inner) return '‹ReactElement›';
      if (seen.has(inner)) return '‹circular›';
      seen.add(inner);

      // 長陣列只留前幾筆，不然面板會被洗版
      if (Array.isArray(inner) && inner.length > 5) {
        return [...inner.slice(0, 5), `…還有 ${inner.length - 5} 筆`];
      }
    }

    return inner;
  };

  try {
    const json = JSON.stringify(value, replacer, 2);
    return json === undefined ? String(value) : json;
  } catch (error) {
    return `‹無法序列化：${error instanceof Error ? error.message : String(error)}›`;
  }
}
