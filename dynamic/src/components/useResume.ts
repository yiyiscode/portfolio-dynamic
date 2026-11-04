import { useEffect, useState } from 'react';

// PDF 放在 public/Resume.pdf；檔案不存在時回傳 null，按鈕就不顯示。
const URL_ = `${import.meta.env.BASE_URL}Resume.pdf`;

export function useResumeUrl(): string | null {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    fetch(URL_, { method: 'HEAD' }).then((r) => setOk(r.ok && !/html/.test(r.headers.get('content-type') ?? ''))).catch(() => {});
  }, []);
  return ok ? URL_ : null;
}
