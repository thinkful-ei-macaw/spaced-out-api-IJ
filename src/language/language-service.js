import LinkedList from "../utils/linked-list";

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from("language")
      .select(
        "language.id",
        "language.name",
        "language.user_id",
        "language.head",
        "language.total_score"
      )
      .where("language.user_id", user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from("word")
      .select(
        "id",
        "language_id",
        "original",
        "translation",
        "next",
        "memory_value",
        "correct_count",
        "incorrect_count"
      )
      .where({ language_id });
  },
  getNextWord(db, id) {
    if (id === null) {
      return;
    }
    return db
      .from("word")
      .select("original", "correct_count", "incorrect_count")
      .where({ id })
      .first();
  },
  populatList(db, id) {
    let word = this.getNextWord(db, id);
    const list = new LinkedList();
    let id = word.id;
    while (id) {
      list.insertAfter(word);
      id = word.next;
      word = this.getNextWord(db, id);
    }
    return list;
  },
};

module.exports = LanguageService;
