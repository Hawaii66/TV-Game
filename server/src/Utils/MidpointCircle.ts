export interface Pair {
  x: number;
  y: number;
}

export const GetPoints = (x_c: number, y_c: number, r: number): Pair[] => {
  var pairs: Pair[] = [];

  var x = r;
  var y = 0;

  pairs.push({
    x: x + x_c,
    y: y + y_c,
  });

  if (r > 0) {
    pairs.push({ x: -x + x_c, y: -y + y_c });
    pairs.push({ x: y + x_c, y: x + y_c });
    pairs.push({ x: -y + x_c, y: -x + y_c });
  }

  var P = 1 - r;
  while (x > y) {
    y += 1;

    if (P <= 0) {
      P = P + 2 * y + 1;
    } else {
      x -= 1;
      P = P + 2 * y - 2 * x + 1;
    }

    if (x < y) {
      break;
    }

    pairs.push({ x: x + x_c, y: y + y_c });
    pairs.push({ x: -x + x_c, y: y + y_c });
    pairs.push({ x: x + x_c, y: -y + y_c });
    pairs.push({ x: -x + x_c, y: -y + y_c });

    if (x != y) {
      pairs.push({ x: y + x_c, y: x + y_c });
      pairs.push({ x: -y + x_c, y: x + y_c });
      pairs.push({ x: y + x_c, y: -x + y_c });
      pairs.push({ x: -y + x_c, y: -x + y_c });
    }
  }

  const set = new Set(pairs);

  return Array.from(set);
};
