import type { ReactNode } from 'react';

type Props = {
  /** 頁面主標題。像搜尋頁那種沒有標題的頁面可以省略，只借用外層的間距 */
  title?: ReactNode;
  /** 標題下方的補充說明，例如縣市、日期 */
  subtitle?: ReactNode;
  /** 標題右側的操作元件，例如編輯按鈕 */
  actions?: ReactNode;
  /** 標題上方的元件，通常是返回連結 */
  before?: ReactNode;
  /** 單一主體的詳情頁用 center，列表與總覽頁用 start */
  align?: 'start' | 'center';
  children: ReactNode;
};

export default function PageLayout({ title, subtitle, actions, before, align = 'start', children }: Props) {
  const hasHeader = Boolean(title || subtitle || actions);

  return (
    <div className="flex w-full flex-1 flex-col gap-10">
      {(before || hasHeader) && (
        <div className="flex flex-col gap-4">
          {before}
          {hasHeader && (
            <header className={`flex flex-col gap-2 ${align === 'center' ? 'items-center text-center' : ''}`}>
              <div className="flex flex-wrap items-center gap-3">
                {title && <h1 className="text-3xl font-bold">{title}</h1>}
                {actions}
              </div>
              {subtitle && <p className="text-background-contrary/60 text-lg">{subtitle}</p>}
            </header>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
