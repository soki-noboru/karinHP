"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "success" | "error";

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
    if (!accessKey) {
      setStatus("error");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append("access_key", accessKey);
    formData.append("subject", "【ホームページ】お問い合わせ・ご予約");

    setStatus("sending");

    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="form__status form__status--success">
        送信しました。お返事まで少々お待ちください。
      </div>
    );
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form__field">
        <label htmlFor="name">お名前</label>
        <input id="name" name="name" type="text" required autoComplete="name" />
      </div>

      <div className="form__field">
        <label htmlFor="email">メールアドレス</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>

      <div className="form__field">
        <label htmlFor="menu">ご希望のメニュー（任意）</label>
        <input id="menu" name="ご希望のメニュー" type="text" placeholder="例: 60分コース" />
      </div>

      <div className="form__field">
        <label htmlFor="message">お問い合わせ内容・ご希望日時など</label>
        <textarea id="message" name="message" required />
      </div>

      {/* ボット対策（人間には見えないハニーポット欄） */}
      <input type="checkbox" name="botcheck" style={{ display: "none" }} />

      <button className="form__submit" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "送信中..." : "送信する"}
      </button>

      {status === "error" && (
        <div className="form__status form__status--error">
          送信に失敗しました。時間をおいて再度お試しいただくか、SNSからご連絡ください。
        </div>
      )}

      <p className="form__note">
        入力いただいた内容は、お問い合わせへの返信にのみ利用します。
      </p>
      <p className="form__note">
        ご予約はLINE・Instagramのメッセージからでも承っております。
      </p>
    </form>
  );
}
