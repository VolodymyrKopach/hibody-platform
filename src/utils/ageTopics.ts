/**
 * Utility functions for age-specific topic management
 */

// Age group constants
export const AGE_GROUPS = {
  EARLY_CHILDHOOD: "2-3",
  PRESCHOOL: "4-6",
  PRIMARY_SCHOOL: "7-8",
  MIDDLE_SCHOOL: "9-10",
} as const;

// Topic keys for localization
export const getTopicKeys = (ageGroup: string): string[] => {
  switch (ageGroup) {
    case AGE_GROUPS.EARLY_CHILDHOOD:
      return [
        "animals",
        "colors",
        "momAndDad",
        "toys",
        "food",
        "sounds",
        "bodyParts",
        "clothes",
        "home",
        "sleep",
      ];
    case AGE_GROUPS.PRESCHOOL:
      return [
        "letters",
        "numbers",
        "shapes",
        "colors",
        "animals",
        "professions",
        "transport",
        "family",
        "friends",
        "holidays",
      ];
    case AGE_GROUPS.PRIMARY_SCHOOL:
      return [
        "reading",
        "mathematics",
        "nature",
        "planets",
        "stories",
        "countries",
        "sports",
        "art",
        "music",
        "science",
      ];
    case AGE_GROUPS.MIDDLE_SCHOOL:
      return [
        "science",
        "history",
        "geography",
        "inventions",
        "ecology",
        "technology",
        "culture",
        "languages",
        "mathematics",
        "physics",
      ];
    default:
      return [
        "animals",
        "colors",
        "numbers",
        "letters",
        "shapes",
        "family",
        "food",
        "transport",
        "weather",
        "emotions",
      ];
  }
};

// Fallback function for non-localized usage
export const getPopularTopicsByAge = (ageGroup: string): string[] => {
  switch (ageGroup) {
    case AGE_GROUPS.EARLY_CHILDHOOD:
      return [
        "Тварини",
        "Кольори",
        "Мама і тато",
        "Іграшки",
        "Їжа",
        "Звуки",
        "Частини тіла",
        "Одяг",
        "Дім",
        "Сон",
      ];
    case AGE_GROUPS.PRESCHOOL:
      return [
        "Літери",
        "Числа",
        "Фігури",
        "Кольори",
        "Тварини",
        "Професії",
        "Транспорт",
        "Сім'я",
        "Друзі",
        "Свята",
      ];
    case AGE_GROUPS.PRIMARY_SCHOOL:
      return [
        "Читання",
        "Математика",
        "Природа",
        "Планети",
        "Історії",
        "Країни",
        "Спорт",
        "Мистецтво",
        "Музика",
        "Наука",
      ];
    case AGE_GROUPS.MIDDLE_SCHOOL:
      return [
        "Наука",
        "Історія",
        "Географія",
        "Винаходи",
        "Екологія",
        "Технології",
        "Культура",
        "Мови",
        "Математика",
        "Фізика",
      ];
    default:
      return [
        "Тварини",
        "Кольори",
        "Числа",
        "Літери",
        "Фігури",
        "Сім'я",
        "Їжа",
        "Транспорт",
        "Погода",
        "Емоції",
      ];
  }
};

export const isTopicValidForAge = (
  topic: string,
  ageGroup: string,
): boolean => {
  const validTopics = getPopularTopicsByAge(ageGroup);
  return validTopics.includes(topic);
};

export const getAgeGroupLabel = (ageGroup: string): string => {
  switch (ageGroup) {
    case AGE_GROUPS.EARLY_CHILDHOOD:
      return "2-3 роки";
    case AGE_GROUPS.PRESCHOOL:
      return "4-6 років";
    case AGE_GROUPS.PRIMARY_SCHOOL:
      return "7-8 років";
    case AGE_GROUPS.MIDDLE_SCHOOL:
      return "9-10 років";
    default:
      return ageGroup;
  }
};
