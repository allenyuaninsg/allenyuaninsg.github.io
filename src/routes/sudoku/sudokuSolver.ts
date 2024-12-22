export class SudokuSolver {
    private result: number[];
    private count: Map<number, number> = new Map();
    constructor(private puzzle: number[]) {
        this.result = []
    }

    /**
     * solve
     */
    public solve() {
        if (!this.isFeasible(this.puzzle)) {
            return false;
        }
        return this.subsolve(this.puzzle);
    }

    public getResult() {
        return this.result;
    }

    private subsolve(p: number[]) {
        const index = this.findFirstZero(p);
        if (index == -1) {
            this.result = Array.from(p, (v) => v);
            return true;
        }
        const currentRow = Math.floor(index / 9);
        const currentCol = index - 9 * currentRow;
        const currentGrid = SudokuSolver.indexToGridIndex(index);
        console.log(`index=${index}, currentRow=${currentRow}, currentCol=${currentCol}, currentGrid=${currentGrid}`);
        let pp = Array.from(p, (v) => v)
        for (let v = 1; v <= 9; ++v) {
            pp[index] = v;
            if (this.checkOneRow(pp, currentRow) && this.checkOneCol(pp, currentCol) && this.checkOneGrid(pp, currentGrid)) {
                if (this.subsolve(pp)) {
                    return true;
                }
            }
        }
        return false;
    }

    private findFirstZero(p: number[]) {
        for (let i = 0; i < p.length; ++i) {
            if (p[i] == 0) {
                return i;
            }
        }
        return -1;
    }

    private isFeasible(p: number[]) {
        return this.checkCol(p) && this.checkRow(p) && this.checkGrid(p);
    }

    private checkOneRow(p: number[], row: number) {
        const start = row * 9;
        const end = start + 9;
        this.count.clear();
        for (let i = start; i < end; ++i) {
            const v = p[i];
            if (v > 0) {
                if (this.count.has(v)) {
                    return false;
                }
                this.count.set(v, 1);
            }
        }
        return true;
    }

    private checkRow(p: number[]) {
        for (let row = 0; row < 9; ++row) {
            if (!this.checkOneRow(p, row)) {
                return false;
            }
        }
        return true;
    }

    private checkOneCol(p: number[], col: number) {
        const start = col;
        const end = 81 + start;
        this.count.clear();
        for (let i = start; i < end; i += 9) {
            if (p[i] > 0) {
                if (this.count.has(p[i])) {
                    return false;
                }
                this.count.set(p[i], 1);
            }
        }
        return true;
    }

    private checkCol(p: number[]) {
        for (let col = 0; col < 9; ++col) {
            if (!this.checkOneCol(p, col)) {
                return false;
            }
        }
        return true;
    }

    private checkOneGrid(p: number[], gridIndex: number) {
        const index = this.calcGridIndex(gridIndex);
        this.count.clear()
        for (let j = 0; j < index.length; j++) {
            const v = p[index[j]];
            if (v > 0) {
                if (this.count.has(v)) {
                    return false;
                }
                this.count.set(v, 1);
            }

        }
        return true;
    }

    private checkGrid(p: number[]) {
        for (let i = 0; i < 9; ++i) {
            if (!this.checkOneGrid(p, i)) {
                return false;
            }
        }
        return true;
    }

    private calcGridIndex(index: number) {
        const row = Math.floor(index / 3);
        const col = index - 3 * row;
        const leftTop = 9 * (3 * row) + col * 3;
        return [
            leftTop,
            leftTop + 1,
            leftTop + 2,
            leftTop + 9,
            leftTop + 10,
            leftTop + 11,
            leftTop + 18,
            leftTop + 19,
            leftTop + 20
        ]
    }

    static indexToGridIndex(index: number) {
        const row = Math.floor(index / 9);
        const col = index - row * 9;
        const gridRow = Math.floor(row / 3);
        const gridCol = Math.floor(col / 3);
        return gridCol + 3 * gridRow;
    }
}
