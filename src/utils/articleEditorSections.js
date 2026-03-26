export const ARTICLE_SECTION_MAPPING = {
  KRONIK: [
    {
      id: 1,
      key: "profil_konflik",
      title: "Profil Konflik",
      placeholder: 'Tulis paparan "Profil Konflik"',
    },
    {
      id: 2,
      key: "jenis_konflik",
      title: "Jenis Konflik",
      placeholder: 'Tulis paparan "Jenis Konflik"',
    },
    {
      id: 3,
      key: "pihak_terlibat",
      title: "Pihak Terlibat",
      placeholder: 'Tulis paparan "Pihak Terlibat"',
    },
    {
      id: 4,
      key: "lini_masa",
      title: "Lini Masa",
      placeholder: "Tulis pengantar kronologi, 1 paragraf saja",
    },
    {
      id: 5,
      key: "korban_dampak",
      title: "Korban & Dampak",
      placeholder: 'Tulis paparan "Korban & Dampak"',
    },
    {
      id: 6,
      key: "upaya_penyelesaian",
      title: "Upaya Penyelesaian",
      placeholder: 'Tulis paparan "Upaya Penyelesaian"',
    },
  ],
  TILIK: [
    {
      id: 1,
      key: "profil_potensi_konflik",
      title: "Profil Potensi Konflik",
      placeholder: 'Tulis paparan "Profil Potensi Konflik"',
    },
    {
      id: 2,
      key: "jenis_potensi_konflik",
      title: "Jenis Potensi Konflik",
      placeholder: 'Tulis paparan "Jenis Potensi Konflik"',
    },
    {
      id: 3,
      key: "pihak_potensial",
      title: "Pihak Potensi Terlibat",
      placeholder: 'Tulis paparan "Pihak Potensial Terlibat"',
    },
    {
      id: 4,
      key: "indikator",
      title: "Indikator",
      placeholder: 'Tulis paparan "Indikator"',
    },
    {
      id: 5,
      key: "skenario_potensial",
      title: "Skenario Potensial",
      placeholder: 'Tulis paparan "Skenario Potensial"',
    },
    {
      id: 6,
      key: "rujukan_analisis",
      title: "Rujukan Analisis",
      placeholder: 'Tulis paparan "Rujukan Analisis"',
    },
  ],
  DISKURSUS: [],
};

export function createInitialSections(articleType) {
  return (ARTICLE_SECTION_MAPPING[articleType] || []).map((section) => ({
    ...section,
    content: "",
  }));
}

export function createInitialSectionContents(sections) {
  return sections.reduce(
    (accumulator, section) => ({
      ...accumulator,
      [section.id]: section.content,
    }),
    {},
  );
}

export function isTimelineSection(sectionKey) {
  return sectionKey === "lini_masa" || sectionKey === "indikator";
}
