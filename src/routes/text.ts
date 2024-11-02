interface TextProps {
  jp: string;
  en: string;
  el?: Element;
}

interface PortforioTextProps {
  [key: string]: TextProps;
}

export const defportforioTexts: PortforioTextProps = {
  // NOTE: ABOUT
  about_name: {
    jp: '伊藤寛介',
    en: 'Kansuke Ito'
  },
  about_desc1: {
    jp: `
            日本生まれ。フロントエンド、バックエンド、フルスタックエンジニアの経験あり。
            サービスや機能に対しての実装にエンジニアが集中できる開発環境は良いプロダクトを生み出すとの考えから、
            CI/CD、DevOps、自動化にこだわりがある。能動的なアプローチを取り、自らで開発環境を良くしていくためのアクションを取る。
            システムアーキテクチャ選定、サーバー設計・構築、プログラム言語の切り替え、CI/CD基盤構築の経験あり。
            サステナビリティな開発を重視し、テストコードやテスト手法に注力している。
        `,
    en: `
            Born in Japan. Experienced in front-end, back-end, and full-stack engineering.
            He believes that a development environment where engineers can focus on implementation of services and functions will produce good products,
            He is particular about CI/CD, DevOps, and automation. He takes a proactive approach and takes actions to improve the development environment on his own.
            He has experience in system architecture selection, server design and construction, switching programming languages, and CI/CD infrastructure construction.
            He emphasizes sustainable development and focuses on test code and test methods. 
        `
  },
  about_desc2: {
    jp: `
            2015年4月、株式会社NTTデータフロンティアでバックエンドエンジニアとしてキャリアをスタート。
            2019年4月にソフトバンク株式会社への転職を経て、2024年までBOLDLY株式会社にてフロントエンドエンジニアとして活動。
            現在は海外のソフトウェア開発の文化を身を持って感じたいとの思いからカナダにIT留学中。
        `,
    en: `
            In April 2015, he started his career as a backend engineer at NTT Data Frontier Inc.
            After moving to Softbank Corporation in April 2019, he worked as a front-end engineer at BOLDLY Corporation until 2024.
            Currently studying IT abroad in Canada with a desire to experience the culture of software development overseas firsthand.
        `
  },
  // NOTE: HISTORY
  history_0: {
    jp: '誕生',
    en: 'Born'
  },
  history_1: {
    jp: '株式会社NTTデータフロンティア',
    en: 'NTT DATA FRONTIER CORPORATION.'
  },
  history_1_position: {
    jp: 'バックエンドエンジニア',
    en: 'Backend Engineer'
  },
  history_2: {
    jp: 'ソフトバンク株式会社',
    en: 'SoftBank Corp.'
  },
  history_2_position: {
    jp: 'バックエンドエンジニア,フルスタックエンジニア,スクラムマスター',
    en: 'Backend Engineer,Fullstack Engineer,Scrum Master'
  },
  history_3: {
    jp: 'BOLDLY株式会社',
    en: 'BOLDLY Inc.'
  },
  history_3_position: {
    jp: 'フロントエンドエンジニア',
    en: 'Frontend Engineer'
  },
  // NOTE: SKILL
  skill_note1: {
    jp: 'このポートフォリオで使われている技術については',
    en: 'The technology used in this portfolio is represented by '
  },
  skill_note2: {
    jp: 'で表しています。',
    en: ''
  },
  // NOTE: PROJECTS
  projects_1_company: {
    jp: 'BOLDLY',
    en: 'BOLDLY'
  },
  projects_1_product: {
    jp: '自動運転車両運行監視プラットフォーム「Dispatcher」の機能開発',
    en: 'Automated vehicle operation monitoring platform "Dispatcher"'
  },
  projects_2_company: {
    jp: 'ソフトバンク',
    en: 'SoftBank'
  },
  projects_2_product: {
    jp: 'オンラインストアシステムの設計・開発',
    en: 'Design and Development of Online Store System'
  },
  projects_3_company: {
    jp: 'ソフトバンク',
    en: 'SoftBank'
  },
  projects_3_product: {
    jp: '店舗スタッフ用見込み顧客システムの設計・開発',
    en: 'Design and Development of Prospective Client System for Store Staff'
  },
  projects_4_company: {
    jp: '通信子会社',
    en: 'Telecom Subsidiary'
  },
  projects_4_product: {
    jp: 'オンラインストアシステムの設計・開発',
    en: 'Design and Development of Online Store System'
  },
  projects_5_company: {
    jp: '地方銀行',
    en: 'Regional Bank'
  },
  projects_5_product: {
    jp: 'インターネットバンキングシステムのリプレース開発',
    en: 'Replacement Development of Internet Banking System'
  },
  projects_6_company: {
    jp: 'NTTData',
    en: 'NTTData'
  },
  projects_6_product: {
    jp: 'オープンソース「TERASOLUNA」の検証・ドキュメント執筆',
    en: "Verification and Documentation of Open Source 'TERASOLUNA'"
  },
  projects_7_company: {
    jp: '金融機関',
    en: 'Financial Institution'
  },
  projects_7_product: {
    jp: '内部向けシステムの設計・開発',
    en: 'Design and Development of Internal System'
  }
};
