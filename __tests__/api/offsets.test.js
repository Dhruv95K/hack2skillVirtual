import { GET } from '@/app/api/offsets/route';
import { OFFSET_PROGRAMS } from '@/lib/offsets';
describe('GET /api/offsets', () => {
  it('should return 200 and the list of offset programs', async () => {
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual({
      programs: OFFSET_PROGRAMS
    });
    expect(data.programs).toHaveLength(6);

    // Each program has: name, description, url, category, impact
    const firstProgram = data.programs[0];
    expect(firstProgram).toHaveProperty('name');
    expect(firstProgram).toHaveProperty('description');
    expect(firstProgram).toHaveProperty('url');
    expect(firstProgram).toHaveProperty('category');
    expect(firstProgram).toHaveProperty('impact');
  });
});