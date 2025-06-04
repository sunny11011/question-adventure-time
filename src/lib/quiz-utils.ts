interface TriviaQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface CategoryQuestions {
  response_code: number;
  results: TriviaQuestion[];
}

export const fetchQuestionsForCategory = async (
  categoryId: number,
  difficulty: string,
  amount: number
): Promise<TriviaQuestion[]> => {
  try {
    const response = await fetch(
      `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&difficulty=${difficulty}&type=multiple`
    );
    const data: CategoryQuestions = await response.json();
    return data.results;
  } catch (error) {
    console.error(`Error fetching questions for category ${categoryId}:`, error);
    return [];
  }
};