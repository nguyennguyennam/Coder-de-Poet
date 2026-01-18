import { Injectable } from "@nestjs/common";

type QuizSuccess = { success: true; tag?: string; quizRaw: any };
type QuizFail = { error: string };
type QuizResult = QuizSuccess | QuizFail;

@Injectable()
export class QuizStore {
  private results = new Map<string, { data: QuizResult; expireAt: number }>();
  private waiters = new Map<string, Array<(r: QuizResult) => void>>();

  private readonly MAX_WAITERS_PER_KEY = 50;

  private readonly RESULT_TTL_MS = 5 * 60 * 1000; 

  set(lessonId: string, data: QuizResult) {
    const expireAt = Date.now() + this.RESULT_TTL_MS;
    this.results.set(lessonId, { data, expireAt });

    const list = this.waiters.get(lessonId);
    if (list?.length) {
      list.forEach(fn => fn(data));
      this.waiters.delete(lessonId);
    }
  }

  get(lessonId: string): QuizResult | undefined {
    const entry = this.results.get(lessonId);
    if (!entry) return undefined;

    if (Date.now() >= entry.expireAt) {
      this.results.delete(lessonId);
      return undefined;
    }
    return entry.data;
  }

  delete(lessonId: string) {
    this.results.delete(lessonId);
  }

  async wait(lessonId: string, timeoutMs: number): Promise<QuizResult | null> {
    const existing = this.get(lessonId);
    if (existing) return existing;

    const current = this.waiters.get(lessonId)?.length ?? 0;
    if (current >= this.MAX_WAITERS_PER_KEY) {
      return { error: "Too many concurrent waiters for this lesson. Try again." };
    }

    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(null), timeoutMs);

      const list = this.waiters.get(lessonId) ?? [];
      list.push((r) => {
        clearTimeout(timer);
        resolve(r);
      });
      this.waiters.set(lessonId, list);
    });
  }
}
