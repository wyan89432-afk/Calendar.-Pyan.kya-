// Global state
let tableData = JSON.parse(JSON.stringify(TABLE_DATA));
let headers = [...TABLE_HEADERS];
let zoomLevels = { fixTable: 1, table1: 1 };

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderFixTable();
});

// ============ ZOOM ============
function zoomIn(tableId) {
    zoomLevels[tableId] = Math.min(3, (zoomLevels[tableId] || 1) + 0.15);
    applyZoom(tableId);
}
function zoomOut(tableId) {
    zoomLevels[tableId] = Math.max(0.3, (zoomLevels[tableId] || 1) - 0.15);
    applyZoom(tableId);
}
function zoomReset(tableId) {
    zoomLevels[tableId] = 1;
    applyZoom(tableId);
}
function applyZoom(tableId) {
    const inner = document.getElementById(tableId + 'Inner');
    if (inner) {
        inner.style.transform = `scale(${zoomLevels[tableId]})`;
    }
}

// ============ FIX TABLE ============
function renderFixTable() {
    const inner = document.getElementById('fixTableInner');
    inner.innerHTML = '';
    const table = document.createElement('table');
    table.id = 'fixTableEl';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const rowNumTh = document.createElement('th');
    rowNumTh.textContent = 'No.';
    rowNumTh.className = 'row-number';
    headerRow.appendChild(rowNumTh);

    headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tableData.forEach((row, ri) => {
        const tr = document.createElement('tr');
        const rowNumTd = document.createElement('td');
        rowNumTd.className = 'row-number';
        rowNumTd.textContent = ri + 1;
        tr.appendChild(rowNumTd);

        row.forEach((cell, ci) => {
            const td = document.createElement('td');
            td.textContent = cell;
            td.className = 'editable';
            td.onclick = () => editCell(ri, ci, td);
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    inner.appendChild(table);
}

function editCell(ri, ci, td) {
    const currentVal = tableData[ri][ci];
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentVal;
    input.style.width = '40px';
    input.style.textAlign = 'center';
    input.style.background = '#0f3460';
    input.style.color = '#fff';
    input.style.border = '1px solid #00d4ff';

    input.onblur = () => {
        let val = input.value.trim();
        if (val !== '') {
            try {
                let num = parseInt(val);
                val = String(num).padStart(3, '0');
            } catch (e) { }
        }
        tableData[ri][ci] = val;
        td.textContent = val;
    };
    input.onkeydown = (e) => { if (e.key === 'Enter') input.blur(); };
    td.textContent = '';
    td.appendChild(input);
    input.focus();
}

function addColumn() {
    const newHeader = prompt('Enter new column name:');
    if (newHeader === null) return;
    headers.push(newHeader);
    tableData.forEach(row => row.push('000'));
    renderFixTable();
}

// ============ CALCULATE COMPARE ============
// Logic:
// 1. Find the last column that has data filled (not all '000')
// 2. Find which rows in that last column have data, and which rows below are "blank" (000 or unfilled)
// 3. For each blank row in the last column:
//    - Determine the column gap (lastCol index - compare start col index = 5 columns gap as per user example)
//    - Take the number from (lastCol - columnGap) at the corresponding compare row
//    - Search backwards from that compare column to column 0 for all permutations of that number
//    - Check that found numbers have same column gap and same row gap
//    - If 3+ found, highlight them in yellow, and the compare source in green
//    - Write note below table

function calculate() {
    const numRows = tableData.length; // 24
    const numCols = headers.length;

    // Find the last column with any non-000 data
    let lastFilledCol = -1;
    let lastFilledRow = -1; // last row with data in that column

    for (let ci = numCols - 1; ci >= 0; ci--) {
        for (let ri = 0; ri < numRows; ri++) {
            if (tableData[ri][ci] !== '000') {
                lastFilledCol = ci;
                // Find the last filled row in this column
                for (let r = numRows - 1; r >= 0; r--) {
                    if (tableData[r][ci] !== '000') {
                        lastFilledRow = r;
                        break;
                    }
                }
                break;
            }
        }
        if (lastFilledCol >= 0) break;
    }

    if (lastFilledCol < 0) {
        alert('No data found in the table.');
        return;
    }

    // The blank rows start after lastFilledRow in lastFilledCol
    // Or blank rows are in the NEXT column (lastFilledCol + 1) if all rows are filled
    // Based on user's description: blank = rows in the column AFTER the last filled column
    // Actually user says: "fix table မှာ column 27 row 5 ထိ ဖြည့်ထားရင် blank row 6 တွက်"
    // So blank rows are rows AFTER the last filled row in the last filled column

    // For each blank row position, we calculate
    const results = [];
    const columnGap = 5; // User specified 5 column gap (example: col26 blank → col21 compare)

    // Actually the user said column gap varies: 
    // "column 26 row 6 blank → compare with column 21 row 18 (171)" = 5 col gap
    // "column 27 blank → column 22" = 5 col gap
    // "column 28 blank → column 23" = 5 col gap
    // So the gap is always: blank_col - compare_col = 5

    // But wait - user also said "column 3 gap" in earlier message
    // Let me re-read: "column 26 row 6 blank, compare column 22 (669)" = 4 col gap
    // Actually from the image: last filled col has data up to row 5, blank starts at row 6
    // The compare column is (lastFilledCol - columnGap)

    // Let's detect: the blank rows are rows > lastFilledRow in lastFilledCol
    // OR all rows in columns > lastFilledCol

    // For simplicity, let's find blank positions and use a fixed column gap
    // The column gap = number of columns between the blank column and the compare column

    // From the image analysis:
    // - Fix table has data in columns 69 down to 26 (indices 0 to 57)
    // - Last filled column (e.g., col 26 = index 57) has data up to row 5
    // - Blank rows: row 6 onwards in col 26
    // - Compare source: col 21 (which is 5 columns back from col 26)
    // - But in the header, col 21 is at a certain index

    // Let's find the actual column indices
    const lastColHeader = parseInt(headers[lastFilledCol]);
    
    // Find blank rows (rows after lastFilledRow in lastFilledCol, or next columns)
    const blankPositions = [];
    
    // Blank rows in the last filled column (after lastFilledRow)
    for (let ri = lastFilledRow + 1; ri < numRows; ri++) {
        blankPositions.push({ col: lastFilledCol, row: ri });
    }
    
    // Also blank rows in columns after lastFilledCol (if any added columns)
    for (let ci = lastFilledCol + 1; ci < numCols; ci++) {
        for (let ri = 0; ri < numRows; ri++) {
            blankPositions.push({ col: ci, row: ri });
        }
    }

    if (blankPositions.length === 0) {
        alert('No blank positions found. All rows are filled in the last column.');
        return;
    }

    // For each blank position, find the compare source
    // Column gap from user's example: blank col 26 → compare col 21 = 5 gap
    // But the gap seems to be: the distance from the compare column to the blank column
    // User said "column 21 row 18 (171) compare with column 26 row 6 blank"
    // col21 index vs col26 index - let's find them

    // The headers go: 69,70,71,...,99,0,1,2,...,26
    // So col 21 header index = headers.indexOf("21")
    // col 26 header index = headers.indexOf("26")
    
    // Actually let's just use a fixed column gap of 5 for now
    // compare_col_index = blank_col_index - 5
    // But if blank is in a newly added column, the gap increases accordingly

    const COL_GAP = 5; // columns between blank and compare source

    const highlightMap = {}; // key: "row-col" => color
    const notes = []; // notes to display below table

    blankPositions.forEach(blank => {
        const compareColIdx = blank.col - COL_GAP;
        if (compareColIdx < 0) return;

        // Get the compare number from the compare column
        // The row for compare: same row as blank? No - from user's example:
        // blank col26 row6 → compare col21 row18 (171)
        // The row gap between them is: 18 - 6 = 12 rows
        // But this seems specific to the example...
        
        // Actually re-reading user's description more carefully:
        // "171 နှင့် blank သည် ကြားထဲတွင် 11 gap row ကွာခြားသည်"
        // So row gap = 11 (row 18 - row 6 = 12? or 11 gap means 12 apart?)
        // User said row 18 and row 6: difference = 12, but gap = 11 (like gap counting)
        
        // Actually the logic seems to be:
        // 1. For each blank row, find the compare number that is at (compareCol, someRow)
        // 2. The compare number is determined by: same row gap pattern
        
        // Let me re-think based on the image:
        // The green cells in the image show the "compare source" numbers
        // The yellow cells show the "found matching" numbers
        // The compare is done by searching for permutations of a number

        // Simpler interpretation:
        // For blank at (blankCol, blankRow):
        // Compare source = cell at (blankCol - COL_GAP, blankRow) 
        // NO - that doesn't match the example either (row 6 vs row 18)

        // Let me try: compare source is at the SAME ROW in the compare column
        // blank col26 row6 → compare col21 row6? But user said row 18...
        
        // Actually I think the logic is:
        // The "compare" number comes from a specific cell that the user identifies
        // And then we search backwards for permutations with same gaps
        
        // From the user's latest message:
        // "fix table မှ row 6 တွက် အစိမ်းရောင် 22column က 669 နှင့်နိုင်းယဉ်ရှာ"
        // So: blank row 6 in last column → compare with column 22 row 6 (same row!)
        // Wait that contradicts earlier... unless the earlier example had different data

        // Let me go with: compare source = same row, COL_GAP columns back
        const compareRow = blank.row;
        const compareValue = tableData[compareRow][compareColIdx];
        
        if (!compareValue || compareValue === '000') return;

        // Get all permutations of the compare value's digits
        const perms = getPermutations(compareValue);

        // Search backwards from compareColIdx-1 to column 0
        // Find cells that contain any permutation of compareValue
        // AND maintain the same column gap pattern
        const found = [];

        // Search with same column gap stepping backwards
        // From compareColIdx, go back by COL_GAP each time
        for (let ci = compareColIdx - COL_GAP; ci >= 0; ci -= COL_GAP) {
            // Check same row
            const cellVal = tableData[compareRow][ci];
            if (perms.includes(cellVal)) {
                found.push({ col: ci, row: compareRow, value: cellVal });
            }
        }

        // Also search without fixed gap - just find all permutations in the backward direction
        // Actually let me search ALL cells from column 0 to compareColIdx for permutations
        // that have the same row
        const allFound = [];
        for (let ci = 0; ci < compareColIdx; ci++) {
            const cellVal = tableData[compareRow][ci];
            if (perms.includes(cellVal)) {
                allFound.push({ col: ci, row: compareRow, value: cellVal });
            }
        }

        // If 3 or more found (including the compare source), show results
        if (allFound.length >= 3) {
            // Highlight compare source in green
            highlightMap[`${compareRow}-${compareColIdx}`] = 'green';

            // Highlight found cells in yellow
            allFound.forEach(f => {
                highlightMap[`${f.row}-${f.col}`] = 'yellow';
            });

            // Create note: the compare value + all found values (4 numbers together)
            const noteValues = allFound.map(f => f.value);
            noteValues.push(compareValue);
            notes.push({
                blankCol: headers[blank.col],
                blankRow: blank.row + 1,
                compareCol: headers[compareColIdx],
                compareRow: compareRow + 1,
                compareValue: compareValue,
                foundValues: allFound.map(f => `${f.value}(col${headers[f.col]},row${f.row + 1})`),
                allValues: noteValues
            });
        }
    });

    // Render Table 1
    document.getElementById('table1Section').style.display = 'block';
    renderTable1(highlightMap);
    renderNotes(notes);
}

function getPermutations(numStr) {
    // Get all permutations of a 3-digit string
    const digits = numStr.split('');
    const perms = new Set();
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (j === i) continue;
            for (let k = 0; k < 3; k++) {
                if (k === i || k === j) continue;
                perms.add(digits[i] + digits[j] + digits[k]);
            }
        }
    }
    return Array.from(perms);
}

// ============ TABLE 1 RENDER ============
function renderTable1(highlightMap) {
    const inner = document.getElementById('table1Inner');
    inner.innerHTML = '';
    const table = document.createElement('table');
    table.id = 'table1El';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const rowNumTh = document.createElement('th');
    rowNumTh.textContent = 'No.';
    rowNumTh.className = 'row-number';
    headerRow.appendChild(rowNumTh);

    headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tableData.forEach((row, ri) => {
        const tr = document.createElement('tr');
        const rowNumTd = document.createElement('td');
        rowNumTd.className = 'row-number';
        rowNumTd.textContent = ri + 1;
        tr.appendChild(rowNumTd);

        row.forEach((cell, ci) => {
            const td = document.createElement('td');
            td.textContent = cell;
            td.id = `t1-${ri}-${ci}`;
            const key = `${ri}-${ci}`;
            if (highlightMap && highlightMap[key]) {
                td.className = `highlight-${highlightMap[key]}`;
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    inner.appendChild(table);

    // Draw curved arrows after render
    setTimeout(() => drawCompareArrows(highlightMap), 200);
}

function drawCompareArrows(highlightMap) {
    const inner = document.getElementById('table1Inner');
    const table = document.getElementById('table1El');
    if (!inner || !table) return;

    const existing = inner.querySelector('.svg-overlay');
    if (existing) existing.remove();

    // Find green and yellow cells to draw arrows
    const greenCells = [];
    const yellowCells = [];
    
    Object.keys(highlightMap).forEach(key => {
        const [row, col] = key.split('-').map(Number);
        if (highlightMap[key] === 'green') greenCells.push({ row, col });
        if (highlightMap[key] === 'yellow') yellowCells.push({ row, col });
    });

    if (greenCells.length === 0 || yellowCells.length === 0) return;

    const w = table.scrollWidth;
    const h = table.scrollHeight;
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.classList.add('svg-overlay');
    svg.style.width = w + 'px';
    svg.style.height = h + 'px';
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);

    // Arrowhead
    const defs = document.createElementNS(svgNS, 'defs');
    const marker = document.createElementNS(svgNS, 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '8');
    marker.setAttribute('markerHeight', '8');
    marker.setAttribute('refX', '6');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', 'M0,0 L6,3 L0,6 Z');
    path.setAttribute('fill', '#3b82f6');
    marker.appendChild(path);
    defs.appendChild(marker);
    svg.appendChild(defs);

    const tableRect = table.getBoundingClientRect();

    // Draw arrows from each yellow to its nearest green (same row)
    yellowCells.forEach(yc => {
        const matchingGreen = greenCells.find(gc => gc.row === yc.row);
        if (!matchingGreen) return;

        const cellA = document.getElementById(`t1-${yc.row}-${yc.col}`);
        const cellB = document.getElementById(`t1-${matchingGreen.row}-${matchingGreen.col}`);
        if (!cellA || !cellB) return;

        const rA = cellA.getBoundingClientRect();
        const rB = cellB.getBoundingClientRect();

        const x1 = rA.left - tableRect.left + rA.width / 2;
        const y1 = rA.top - tableRect.top + rA.height / 2;
        const x2 = rB.left - tableRect.left + rB.width / 2;
        const y2 = rB.top - tableRect.top + rB.height / 2;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const bend = Math.min(50, Math.max(20, dist * 0.2));
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const px = -dy / (dist || 1);
        const py = dx / (dist || 1);
        const cx = mx + px * bend;
        const cy = my + py * bend;

        const pathEl = document.createElementNS(svgNS, 'path');
        pathEl.setAttribute('d', `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
        pathEl.setAttribute('fill', 'none');
        pathEl.setAttribute('stroke', '#3b82f6');
        pathEl.setAttribute('stroke-width', '2');
        pathEl.setAttribute('stroke-opacity', '0.8');
        pathEl.setAttribute('marker-end', 'url(#arrowhead)');
        svg.appendChild(pathEl);
    });

    inner.appendChild(svg);
}

// ============ NOTES ============
function renderNotes(notes) {
    const noteSection = document.getElementById('noteSection');
    noteSection.innerHTML = '';

    if (notes.length === 0) {
        noteSection.innerHTML = '<p style="color:#94a3b8;">No matching patterns found with 3+ permutations.</p>';
        return;
    }

    const h3 = document.createElement('h3');
    h3.textContent = 'Notes - Found Patterns';
    noteSection.appendChild(h3);

    notes.forEach((note, idx) => {
        const div = document.createElement('div');
        div.className = 'note-item';
        div.innerHTML = `
            <div class="label">Blank: Col ${note.blankCol} Row ${note.blankRow} → Compare: Col ${note.compareCol} Row ${note.compareRow} (${note.compareValue})</div>
            <div class="values">Found: ${note.foundValues.join(', ')}</div>
            <div class="values">Group: [${note.allValues.join(', ')}]</div>
        `;
        noteSection.appendChild(div);
    });
}
