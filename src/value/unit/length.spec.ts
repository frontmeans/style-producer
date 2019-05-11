import { StypDimension } from '../numeric';
import { StypLength, StypLengthPt } from './length';

describe('StypLength', () => {
  it('has unitless zero', () => {
    expect(StypLength.zero.type).toBe(0);
  });
  it('constructs `StypLength` instance', () => {

    const length = StypLength.of(13, 'px') as StypDimension<StypLength.Unit>;

    expect(length.type).toBe('dimension');
    expect(length.dim).toBe(StypLength);
    expect(length.val).toBe(13);
    expect(length.unit).toBe('px');
  });
});

describe('StypLengthPt', () => {
  it('has unitless zero', () => {
    expect(StypLengthPt.zero.type).toBe(0);
  });
  it('constructs `StypLengthPt` instance', () => {

    const length = StypLengthPt.of(13, '%') as StypDimension<StypLengthPt.Unit>;

    expect(length.type).toBe('dimension');
    expect(length.dim).toBe(StypLengthPt);
    expect(length.val).toBe(13);
    expect(length.unit).toBe('%');
  });
});
