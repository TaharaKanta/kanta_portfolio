import { useTranslations } from "next-intl";

/* eslint-disable react/no-unescaped-entities */
export default function Introduction() {
  const t = useTranslations("Index")

  const currentYear = new Date().getFullYear();
  const experiencedYears = currentYear - 2016;
  return (
    <div className="h-full border-2 m-2 p-2">
      <h2>{t('title')}</h2>
      <h1 className="hero-title">Introduction</h1>
      <p>I am Kanta Tahara. I am a software engineer.</p>
      <p>I am a software engineer who loves to create things.</p>
      <p>Full-Stack Engineer with a passion for building scalable web applications and creating seamless user experiences.
        With over {experiencedYears} years of experience in both front-end and back-end development, I have a proven track record of delivering high-quality projects on time.</p>
      <p>
        Proficient in modern technologies such as React, Node.js, and AWS, and more. I enjoy solving complex problems and continuously learning new skills.
        Let's connect and build something amazing together.
      </p>
    </div>
  );
}