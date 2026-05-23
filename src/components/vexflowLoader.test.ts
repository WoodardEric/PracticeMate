describe('loadVexflow', () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock('vexflow');
  });

  it('reuses the same import promise across calls', async () => {
    let importCount = 0;

    vi.doMock('vexflow', () => {
      importCount += 1;

      return {
        Renderer: { Backends: { SVG: 'svg' } },
      };
    });

    const { loadVexflow } = await import('./vexflowLoader');
    const firstLoad = loadVexflow();
    const secondLoad = loadVexflow();

    expect(firstLoad).toBe(secondLoad);

    await Promise.all([firstLoad, secondLoad]);

    expect(importCount).toBe(1);
  });
});
