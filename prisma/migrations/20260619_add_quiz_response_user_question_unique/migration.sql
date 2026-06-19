ALTER TABLE "quiz_responses"
ADD CONSTRAINT "quiz_responses_user_id_question_key_key"
UNIQUE ("user_id", "question_key");
