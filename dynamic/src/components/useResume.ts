import { useEffect, useState } from 'react';
import { useLangStore } from '../store/stores';

// PDF 放在 public/Fang-Yi_Lin_Resume_ZH.pdf、_EN.pdf，隨語言切換；該語言檔案不存在時回傳 null，按鈕就不顯示。
export function useResumeUrl(): string | null {
  const { lang } = useLangStore();
  const url = `${import.meta.env.BASE_URL}Fang-Yi_Lin_Resume_${lang.toUpperCase()}.pdf`;
  const [ok, setOk] = useState<string | null>(null);
  useEffect(() => {
    fetch(url, { method: 'HEAD' })
      .then((r) => setOk(r.ok && !/html/.test(r.headers.get('content-type') ?? '') ? url : null))
      .catch(() => setOk(null));
  }, [url]);
  return ok === url ? url : null;
}
