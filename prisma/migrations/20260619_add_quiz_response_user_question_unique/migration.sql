WITH ranked_quiz_responses AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, question_key
      ORDER BY created_at ASC, id ASC
    ) AS duplicate_rank
  FROM "quiz_responses"
)
DELETE FROM "quiz_responses"
WHERE id IN (
  SELECT id
  FROM ranked_quiz_responses
  WHERE duplicate_rank > 1
);

ALTER TABLE "quiz_responses"
ADD CONSTRAINT "quiz_responses_user_id_question_key_key"
UNIQUE ("user_id", "question_key");
