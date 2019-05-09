import { stypPercentage } from './percentage';

describe('stypPercentage()', () => {
  it('constructs StypPercentage instance', () => {

    const percentage = stypPercentage(99);

    expect(percentage).toMatchObject({
      type: 'number',
      unit: '%',
      val: 99,
    });
  });
});
