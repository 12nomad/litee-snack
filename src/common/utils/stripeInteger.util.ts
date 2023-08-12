const stripeInteger = (num: number | undefined | null): number => {
  if (!num) return 0;

  const split = num.toString().split('.');
  if (!split[1]) return num;
  if (split[1].length === 1) return num * 10;

  return num * 100;
};

export default stripeInteger;
