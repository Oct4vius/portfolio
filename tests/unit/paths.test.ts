import { withBase } from '../../src/lib/paths';
test('withBase joins under /portfolio/', () => {
  expect(withBase('')).toBe('/portfolio/');
  expect(withBase('es/')).toBe('/portfolio/es/');
  expect(withBase('/cv/Octavio-Luperon-CV-EN.pdf')).toBe('/portfolio/cv/Octavio-Luperon-CV-EN.pdf');
  expect(withBase('cv/a.pdf')).toBe('/portfolio/cv/a.pdf');
});
