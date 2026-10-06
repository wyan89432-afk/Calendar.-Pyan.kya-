// Calendar Pyan Kya
// Display columns start from index 31 (header "0") as display "00"

const DISPLAY_START_INDEX = 31;
let ROWS = Array.isArray(TABLE_DATA) ? TABLE_DATA.length : 24;
const SOURCE_ROWS_URL = 'https://raw.githubusercontent.com/wyan89432-afk/key_and_one_change/main/fixed-table.csv';
const GAP_BETWEEN = 107; // 107 cells are between the two positions
const GAP_OFFSET = GAP_BETWEEN + 1; // position-to-position distance = 108
const GAP_560_BETWEEN = 592; // 592 cells between 560 Red and Yellow positions
const GAP_560_OFFSET = GAP_560_BETWEEN + 1; // position-to-position distance = 593
const RED_560_START_HEADER = '73';
const YELLOW_560_START_HEADER = '05';

let zoomLevel = 1;
let tableData = [];
let tableHeaders = [];
let addedColumns = [];

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderAll();
    syncRowCountFromSource();
    document.getElementById('addColBtn').addEventListener('click', addColumn);
    document.getElementById('compareBtn').addEventListener('click', runCompare);
    document.getElementById('zoomIn').addEventListener('click', () => setZoom(zoomLevel + 0.1));
    document.getElementById('zoomOut').addEventListener('click', () => setZoom(zoomLevel - 0.1));
    document.getElementById('zoomReset').addEventListener('click', () => setZoom(1));
});

function loadData() {
    tableHeaders = [...TABLE_HEADERS];
    tableData = TABLE_DATA.map(row => [...row]);
    ROWS = tableData.length || 24;
    const saved = localStorage.getItem('calendarPyanKya_data');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.addedColumns) {
                addedColumns = parsed.addedColumns;
                for (const col of addedColumns) {
                    tableHeaders.push(col.name);
                    for (let r = 0; r < ROWS; r++) {
                        tableData[r].push(col.data[r] || '');
                    }
                }
            }
        } catch(e) {}
    }
}

/*
 * Read only the row count from key_and_one_change's fixed table.
 * Calendar values are not imported or overwritten.
 * If the source cannot be reached, the local row count is kept.
 */
async function syncRowCountFromSource() {
    const fallbackRows = Array.isArray(TABLE_DATA) ? TABLE_DATA.length : 24;
    try {
        const response = await fetch(SOURCE_ROWS_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error('source unavailable');

        const csv = (await response.text()).replace(/^\uFEFF/, '');
        const lines = csv.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        const sourceRows = Math.max(0, lines.length - 1); // header is row 0
        if (!sourceRows) throw new Error('source has no data rows');

        // Never shrink below the rows that actually exist in the fixed table.
        // The source file controls row growth, but must not hide newly fixed rows.
        ROWS = Math.max(sourceRows, tableData.length, Array.isArray(TABLE_DATA) ? TABLE_DATA.length : 0);

        // Keep existing Calendar data; safely resize only when more rows are needed.
        const width = tableHeaders.length;
        if (tableData.length < ROWS) {
            while (tableData.length < ROWS) tableData.push(new Array(width).fill(''));
        }

        for (const col of addedColumns) {
            col.data = Array.from({ length: ROWS }, (_, r) => col.data?.[r] || '');
        }

        renderAll();
    } catch (e) {
        ROWS = fallbackRows;
        // Silent fallback: network/CORS/source errors must never break Calendar.
        if (tableData.length > ROWS) tableData = tableData.slice(0, ROWS);
        while (tableData.length < ROWS) tableData.push(new Array(tableHeaders.length).fill(''));
        renderAll();
    }
}

function saveData() {
    localStorage.setItem('calendarPyanKya_data', JSON.stringify({ addedColumns }));
}

function addColumn() {
    const lastHeader = tableHeaders[tableHeaders.length - 1];
    const nextNum = parseInt(lastHeader) + 1;
    const newName = String(nextNum);
    tableHeaders.push(newName);
    const newColData = new Array(ROWS).fill('');
    for (let r = 0; r < ROWS; r++) tableData[r].push('');
    addedColumns.push({ name: newName, data: newColData });
    saveData();
    renderAll();
}

function renderAll() {
    renderFixTable();
    renderGreenTable();
    renderYellowTable();
    render560RedTable();
    render560YellowTable();
}

function getDisplayColCount() {
    return tableHeaders.length - DISPLAY_START_INDEX;
}

function colName(idx) {
    return String(idx).padStart(2, '0');
}

// Convert display col + row to linear position (0-based)
function toLinear(col, row) {
    return col * ROWS + row;
}

// Convert linear position back to col + row
function fromLinear(pos) {
    const totalCols = getDisplayColCount();
    const totalCells = totalCols * ROWS;
    if (pos < 0 || pos >= totalCells) return null;
    return { col: Math.floor(pos / ROWS), row: pos % ROWS };
}

// ============ FIX TABLE ============
function renderFixTable() {
    const table = document.getElementById('fixTable');
    const totalCols = getDisplayColCount();
    let html = '<thead><tr><th>No</th>';
    for (let c = 0; c < totalCols; c++) html += '<th>' + colName(c) + '</th>';
    html += '</tr></thead><tbody>';
    for (let r = 0; r < ROWS; r++) {
        html += '<tr><td class="row-num">' + (r + 1) + '</td>';
        for (let c = 0; c < totalCols; c++) {
            const arrIdx = DISPLAY_START_INDEX + c;
            const val = tableData[r]?.[arrIdx] || '';
            const isEmpty = val.trim() === '';
            html += '<td class="' + (isEmpty ? 'empty-cell' : '') + '">';
            html += '<input type="text" maxlength="3" value="' + (isEmpty ? '' : val) + '" ';
            html += 'data-row="' + r + '" data-col="' + arrIdx + '" ';
            html += 'onchange="onCellEdit(this)" placeholder="' + (isEmpty ? 'xxx' : '') + '">';
            html += '</td>';
        }
        html += '</tr>';
    }
    html += '</tbody>';
    table.innerHTML = html;
}

function onCellEdit(input) {
    const row = parseInt(input.dataset.row);
    const col = parseInt(input.dataset.col);
    let val = input.value.trim();
    if (val && /^\d+$/.test(val)) {
        val = val.padStart(3, '0');
        input.value = val;
    }
    if (!tableData[row]) tableData[row] = new Array(tableHeaders.length).fill('');
    tableData[row][col] = val;
    const origLen = TABLE_HEADERS.length;
    if (col >= origLen) {
        const addedIdx = col - origLen;
        if (addedIdx < addedColumns.length) addedColumns[addedIdx].data[row] = val;
    }
    saveData();
    renderGreenTable();
    renderYellowTable();
    render560RedTable();
    render560YellowTable();
}

// ============ GREEN/RED TABLE (Col 00 to Last) ============
function renderGreenTable() {
    const table = document.getElementById('greenTable');
    const totalCols = getDisplayColCount();
    let html = '<thead><tr><th>No</th>';
    for (let c = 0; c < totalCols; c++) html += '<th>' + colName(c) + '</th>';
    html += '</tr></thead><tbody>';
    for (let r = 0; r < ROWS; r++) {
        html += '<tr><td class="row-num">' + (r + 1) + '</td>';
        for (let c = 0; c < totalCols; c++) {
            const val = tableData[r]?.[DISPLAY_START_INDEX + c] || '';
            const isEmpty = val.trim() === '';
            html += '<td id="green-r' + r + '-c' + c + '" class="' + (isEmpty ? 'xxx-cell' : '') + '">' + (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }
    html += '</tbody>';
    table.innerHTML = html;
}

// ============ YELLOW TABLE (Col 05 to Last) ============
function renderYellowTable() {
    const table = document.getElementById('yellowTable');
    const totalCols = getDisplayColCount();
    let html = '<thead><tr><th>No</th>';
    for (let c = 5; c < totalCols; c++) html += '<th>' + colName(c) + '</th>';
    html += '</tr></thead><tbody>';
    for (let r = 0; r < ROWS; r++) {
        html += '<tr><td class="row-num">' + (r + 1) + '</td>';
        for (let c = 5; c < totalCols; c++) {
            const val = tableData[r][DISPLAY_START_INDEX + c] || '';
            const isEmpty = val.trim() === '';
            html += '<td id="yellow-r' + r + '-c' + c + '" class="' + (isEmpty ? 'xxx-cell' : '') + '">' + (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }
    html += '</tbody>';
    table.innerHTML = html;
}

// ============ COMPARE LOGIC ============
function runCompare540() {
    renderGreenTable();
    renderYellowTable();

    const totalCols = getDisplayColCount();
    if (totalCols <= 0 || ROWS <= 0) {
        document.getElementById('noteSection').innerHTML = '<div class="note-item">Data မရှိပါ။</div>';
        return;
    }

    /*
     * Compare starts from the LAST REAL NUMBER in the LAST UPDATED column.
     * It does NOT search for blank rows.
     *
     * The last trailing 000 placeholders are removed from data.js, and any
     * remaining 000 inside the table is treated as a real number.
     */
    let lastFilledCol = -1;
    let lastFilledRow = -1;

    for (let c = totalCols - 1; c >= 0; c--) {
        for (let r = ROWS - 1; r >= 0; r--) {
            const value = tableData[r]?.[DISPLAY_START_INDEX + c];
            if (typeof value === 'string' && value.trim() !== '') {
                lastFilledCol = c;
                lastFilledRow = r;
                break;
            }
        }
        if (lastFilledCol >= 0) break;
    }

    if (lastFilledCol < 0 || lastFilledRow < 0) {
        document.getElementById('noteSection').innerHTML = '<div class="note-item">Data မရှိပါ။</div>';
        return;
    }

    // This is the single calculation anchor: the last number in the last updated column.
    const anchorLinear = toLinear(lastFilledCol, lastFilledRow);
    const sourceLinear = anchorLinear - GAP_OFFSET;
    const sourcePos = fromLinear(sourceLinear);

    if (!sourcePos) {
        document.getElementById('noteSection').innerHTML =
            '<div class="note-item">107 gap အတွက် source position မရှိပါ။</div>';
        return;
    }

    const sourceVal = tableData[sourcePos.row]?.[DISPLAY_START_INDEX + sourcePos.col] || '';
    if (!sourceVal.trim()) {
        document.getElementById('noteSection').innerHTML =
            '<div class="note-item">107 gap source number မရှိပါ။</div>';
        return;
    }

    // Highlight the 107-gap source position in the 540 Red table.
    const greenSrc = document.getElementById(
        'green-r' + sourcePos.row + '-c' + sourcePos.col
    );
    if (greenSrc) greenSrc.classList.add('compare-source');

    // IMPORTANT:
    // The 540 Yellow table value does NOT need to equal the Red value.
    // Yellow is selected only by the calculated 107-gap POSITION.
    // Therefore, do not compare the Yellow cell's number with the Red match.

    // Find every 3-digit permutation backward in the 540 Red area, from the
    // source position toward column 00.
    const perms = getPermutations(sourceVal);
    const foundInRed = [];

    for (let searchLinear = sourceLinear - 1; searchLinear >= 0; searchLinear--) {
        const sPos = fromLinear(searchLinear);
        if (!sPos) continue;

        const cellVal = tableData[sPos.row]?.[DISPLAY_START_INDEX + sPos.col] || '';
        if (cellVal && perms.includes(cellVal)) {
            foundInRed.push({
                col: sPos.col,
                row: sPos.row,
                val: cellVal,
                linear: searchLinear
            });

            const gCell = document.getElementById(
                'green-r' + sPos.row + '-c' + sPos.col
            );
            if (gCell) gCell.classList.add('match-found');
        }
    }

    // Every Red match is moved forward by the same 107-gap offset.
    // Only positions inside the 540 Yellow area (05 -> last updated column) are shown.
    const foundInYellow = [];
    const arrowPairs = [];

    for (const match of foundInRed) {
        const yellowLinear = match.linear + GAP_OFFSET;
        const yPos = fromLinear(yellowLinear);
        if (!yPos || yPos.col < 5) continue;

        // Yellow value can be different. We use POSITION ONLY.
        // The cell at this 107-gap position is highlighted regardless of its number.
        const yVal = tableData[yPos.row]?.[DISPLAY_START_INDEX + yPos.col] || '';
        foundInYellow.push({
            col: yPos.col,
            row: yPos.row,
            val: yVal,
            sourceMatch: match
        });

        const yCell = document.getElementById(
            'yellow-r' + yPos.row + '-c' + yPos.col
        );
        if (yCell) yCell.classList.add('match-found');

        // Blue line: calculation source -> Red match.
        arrowPairs.push({
            fromRow: sourcePos.row,
            fromCol: sourcePos.col,
            toRow: match.row,
            toCol: match.col,
            table: 'green'
        });

        // Blue line: Yellow anchor -> corresponding Yellow position.
        arrowPairs.push({
            fromRow: lastFilledRow,
            fromCol: lastFilledCol,
            toRow: yPos.row,
            toCol: yPos.col,
            table: 'yellow'
        });
    }

    const redList = foundInRed
        .map(m => m.val + '(R' + (m.row + 1) + ',C' + colName(m.col) + ')')
        .join(', ');

    const yellowList = foundInYellow
        .map(m => (m.val || 'blank') + '(R' + (m.row + 1) + ',C' + colName(m.col) + ')')
        .join(', ');

    if (foundInRed.length > 0) {
        const matchClass = foundInRed.length >= 3 ? 'match-3plus' : '';
        document.getElementById('noteSection').innerHTML =
            '<div class="note-item ' + matchClass + '">' +
            'Last: C' + colName(lastFilledCol) + ' R' + (lastFilledRow + 1) + ' = ' +
            (tableData[lastFilledRow][DISPLAY_START_INDEX + lastFilledCol] || '') +
            ' | Gap: ' + GAP_BETWEEN +
            ' | Red Source: C' + colName(sourcePos.col) + ' R' + (sourcePos.row + 1) +
            ' = ' + sourceVal +
            ' | Perms: [' + perms.join(',') + ']' +
            ' | Found(' + foundInRed.length + '): ' + redList +
            ' | Yellow: ' + yellowList +
            '</div>';
    } else {
        document.getElementById('noteSection').innerHTML =
            '<div class="note-item">107 gap အရ Red table မှာ match မတွေ့ပါ။</div>';
    }

    drawArrows(arrowPairs);
}

// ============ 560 TABLES ============
function normalizeHeaderValue(value) {
    const s = String(value ?? '').trim();
    if (/^\d+$/.test(s)) return String(parseInt(s, 10));
    return s;
}

function getHeaderIndex(header) {
    const target = normalizeHeaderValue(header);
    return tableHeaders.findIndex(h => normalizeHeaderValue(h) === target);
}

function getLastUpdatedColumn(startIndex, endIndex) {
    for (let c = endIndex; c >= startIndex; c--) {
        for (let r = ROWS - 1; r >= 0; r--) {
            const value = tableData[r]?.[c];
            if (typeof value === 'string' && value.trim() !== '') return c;
        }
    }
    return -1;
}

function toLinear560(absCol, row, startCol) {
    return (absCol - startCol) * ROWS + row;
}

function fromLinear560(pos, startCol, endCol) {
    if (pos < 0) return null;
    const totalCols = endCol - startCol + 1;
    const totalCells = totalCols * ROWS;
    if (pos >= totalCells) return null;
    return {
        col: startCol + Math.floor(pos / ROWS),
        row: pos % ROWS
    };
}

function getHeaderDisplayName(absCol) {
    const value = String(tableHeaders[absCol] ?? '');
    return value.length < 2 ? value.padStart(2, '0') : value;
}

function render560RedTable() {
    const table = document.getElementById('red560Table');
    if (!table) return;

    const startCol = getHeaderIndex(RED_560_START_HEADER);
    const endCol = getLastUpdatedColumn(startCol, tableHeaders.length - 1);
    if (startCol < 0 || endCol < startCol) {
        table.innerHTML = '';
        return;
    }

    let html = '<thead><tr><th>No</th>';
    for (let c = startCol; c <= endCol; c++) {
        html += '<th>' + getHeaderDisplayName(c) + '</th>';
    }
    html += '</tr></thead><tbody>';

    for (let r = 0; r < ROWS; r++) {
        html += '<tr><td class="row-num">' + (r + 1) + '</td>';
        for (let c = startCol; c <= endCol; c++) {
            const val = tableData[r]?.[c] || '';
            const isEmpty = val.trim() === '';
            html += '<td id="red560-r' + r + '-c' + c + '" class="' +
                (isEmpty ? 'xxx-cell' : '') + '">' + (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody>';
    table.innerHTML = html;
}

function render560YellowTable() {
    const table = document.getElementById('yellow560Table');
    if (!table) return;

    const startCol = getHeaderIndex(YELLOW_560_START_HEADER);
    const endCol = getLastUpdatedColumn(startCol, tableHeaders.length - 1);
    if (startCol < 0 || endCol < startCol) {
        table.innerHTML = '';
        return;
    }

    let html = '<thead><tr><th>No</th>';
    for (let c = startCol; c <= endCol; c++) {
        html += '<th>' + getHeaderDisplayName(c) + '</th>';
    }
    html += '</tr></thead><tbody>';

    for (let r = 0; r < ROWS; r++) {
        html += '<tr><td class="row-num">' + (r + 1) + '</td>';
        for (let c = startCol; c <= endCol; c++) {
            const val = tableData[r]?.[c] || '';
            const isEmpty = val.trim() === '';
            html += '<td id="yellow560-r' + r + '-c' + c + '" class="' +
                (isEmpty ? 'xxx-cell' : '') + '">' + (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody>';
    table.innerHTML = html;
}

function runCompare560() {
    render560RedTable();
    render560YellowTable();
    const redStart = getHeaderIndex(RED_560_START_HEADER);
    const yellowStart = getHeaderIndex(YELLOW_560_START_HEADER);
    const overallEnd = getLastUpdatedColumn(Math.min(redStart, yellowStart), tableHeaders.length - 1);

    if (redStart < 0 || yellowStart < 0 || overallEnd < redStart || ROWS <= 0) {
        return '<div class="note-item">560 data မရှိပါ။</div>';
    }

    // The 560 calculation uses the last real value in the last updated column
    // as its Yellow-side anchor. Yellow's value is never compared to Red values.
    const lastUpdatedCol = overallEnd;
    let anchorRow = -1;

    for (let r = ROWS - 1; r >= 0; r--) {
        const value = tableData[r]?.[lastUpdatedCol];
        if (typeof value === 'string' && value.trim() !== '') {
            anchorRow = r;
            break;
        }
    }

    if (anchorRow < 0) {
        return '<div class="note-item">560 last updated column မှ number မရှိပါ။</div>';
    }

    // Use one continuous 560 sequence from Red column 73 through the last updated column.
    // This keeps the 592-gap calculation consistent across 99 -> 00 -> ... columns.
    const anchorLinear = toLinear560(lastUpdatedCol, anchorRow, redStart);
    const sourceLinear = anchorLinear - GAP_560_OFFSET;
    const sourcePos = fromLinear560(sourceLinear, redStart, lastUpdatedCol);

    if (!sourcePos || sourcePos.col < redStart) {
        return '<div class="note-item">560 gap 592 အတွက် Red source position မရှိပါ။</div>';
    }

    const sourceVal = tableData[sourcePos.row]?.[sourcePos.col] || '';
    if (!sourceVal.trim()) {
        return '<div class="note-item">560 gap 592 source number မရှိပါ။</div>';
    }

    const sourceCell = document.getElementById(
        'red560-r' + sourcePos.row + '-c' + sourcePos.col
    );
    if (sourceCell) sourceCell.classList.add('compare-source');

    // Red numbers are the only numbers searched.
    // 768 -> 768 / 786 / 687 / 867 ... all valid 3-digit permutations.
    const perms = getPermutations(sourceVal);
    const foundInRed = [];

    for (let searchLinear = sourceLinear - 1; searchLinear >= 0; searchLinear--) {
        const pos = fromLinear560(searchLinear, redStart, lastUpdatedCol);
        if (!pos || pos.col < redStart) continue;

        const cellVal = tableData[pos.row]?.[pos.col] || '';
        if (cellVal && perms.includes(cellVal)) {
            foundInRed.push({
                col: pos.col,
                row: pos.row,
                val: cellVal,
                linear: searchLinear
            });

            const cell = document.getElementById(
                'red560-r' + pos.row + '-c' + pos.col
            );
            if (cell) cell.classList.add('match-found');
        }
    }

    const foundInYellow = [];
    const arrowPairs = [];

    for (const match of foundInRed) {
        const yellowLinear = match.linear + GAP_560_OFFSET;
        const yPos = fromLinear560(yellowLinear, redStart, lastUpdatedCol);
        if (!yPos || yPos.col < yellowStart) continue;

        // Yellow is POSITION-ONLY. Its number does not need to equal the Red number.
        const yVal = tableData[yPos.row]?.[yPos.col] || '';
        const yCell = document.getElementById(
            'yellow560-r' + yPos.row + '-c' + yPos.col
        );

        if (yCell) yCell.classList.add('match-found');

        foundInYellow.push({
            col: yPos.col,
            row: yPos.row,
            val: yVal,
            sourceMatch: match
        });

        // Blue line inside the Red table.
        arrowPairs.push({
            fromRow: sourcePos.row,
            fromCol: sourcePos.col,
            toRow: match.row,
            toCol: match.col,
            table: 'red560'
        });

        // Blue line from the Yellow anchor to its 592-gap calculated position.
        arrowPairs.push({
            fromRow: anchorRow,
            fromCol: lastUpdatedCol,
            toRow: yPos.row,
            toCol: yPos.col,
            table: 'yellow560'
        });
    }

    const redList = foundInRed
        .map(m => m.val + '(R' + (m.row + 1) + ',C' + getHeaderDisplayName(m.col) + ')')
        .join(', ');

    const yellowList = foundInYellow
        .map(m => (m.val || 'blank') + '(R' + (m.row + 1) + ',C' + getHeaderDisplayName(m.col) + ')')
        .join(', ');

    if (foundInRed.length === 0) {
        return '<div class="note-item">560: Gap 592 အရ Red table မှာ permutation match မတွေ့ပါ။</div>';
    }

    drawArrows560(arrowPairs);

    const matchClass = foundInRed.length >= 3 ? 'match-3plus' : '';
    return '<div class="note-item ' + matchClass + '">' +
        '560 Last: C' + getHeaderDisplayName(lastUpdatedCol) + ' R' + (anchorRow + 1) +
        ' = ' + (tableData[anchorRow][lastUpdatedCol] || '') +
        ' | Gap: ' + GAP_560_BETWEEN +
        ' | Red Source: C' + getHeaderDisplayName(sourcePos.col) + ' R' + (sourcePos.row + 1) +
        ' = ' + sourceVal +
        ' | Perms: [' + perms.join(',') + ']' +
        ' | Found(' + foundInRed.length + '): ' + redList +
        ' | Yellow(Position only): ' + yellowList +
        '</div>';
}

function drawArrows560(pairs) {
    const redSvg = document.getElementById('red560Svg');
    const yellowSvg = document.getElementById('yellow560Svg');
    if (!redSvg || !yellowSvg) return;

    redSvg.innerHTML = '';
    yellowSvg.innerHTML = '';
    redSvg.style.width = '100%';
    redSvg.style.height = '100%';
    yellowSvg.style.width = '100%';
    yellowSvg.style.height = '100%';

    addArrowDefs(redSvg);
    addArrowDefs(yellowSvg);

    for (const pair of pairs) {
        if (pair.table === 'red560') {
            drawOneArrow('red560', redSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        } else if (pair.table === 'yellow560') {
            drawOneArrow('yellow560', yellowSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        }
    }
}

function runCompare() {
    const noteSection = document.getElementById('noteSection');
    runCompare540();
    const note540 = noteSection.innerHTML;
    const result560 = runCompare560();

    // Keep 540 results and 560 results together in the Notes section.
    noteSection.innerHTML =
        '<div class="compare-group"><div class="compare-group-title">540 Compare Result</div>' +
        note540 +
        '</div>' +
        '<div class="compare-group"><div class="compare-group-title">560 Compare Result</div>' +
        result560 +
        '</div>';
}

function getPermutations(numStr) {
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

// ============ CURVED ARROWS ============
function drawArrows(pairs) {
    const greenSvg = document.getElementById('greenSvg');
    const yellowSvg = document.getElementById('yellowSvg');
    greenSvg.innerHTML = '';
    yellowSvg.innerHTML = '';
    addArrowDefs(greenSvg);
    addArrowDefs(yellowSvg);
    
    for (const pair of pairs) {
        if (pair.table === 'green') {
            drawOneArrow('green', greenSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        } else {
            drawOneArrow('yellow', yellowSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        }
    }
}

function addArrowDefs(svg) {
    const ns = 'http://www.w3.org/2000/svg';
    const defs = document.createElementNS(ns, 'defs');
    const marker = document.createElementNS(ns, 'marker');
    marker.setAttribute('id', 'ah-' + svg.id);
    marker.setAttribute('markerWidth', '8');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('refX', '8');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    const poly = document.createElementNS(ns, 'polygon');
    poly.setAttribute('points', '0 0, 8 3, 0 6');
    poly.setAttribute('fill', '#0080ff');
    marker.appendChild(poly);
    defs.appendChild(marker);
    svg.appendChild(defs);
}

function drawOneArrow(prefix, svg, fromRow, fromCol, toRow, toCol) {
    const fromCell = document.getElementById(prefix + '-r' + fromRow + '-c' + fromCol);
    const toCell = document.getElementById(prefix + '-r' + toRow + '-c' + toCol);
    if (!fromCell || !toCell) return;
    
    const container = svg.parentElement;
    const cRect = container.getBoundingClientRect();
    const fRect = fromCell.getBoundingClientRect();
    const tRect = toCell.getBoundingClientRect();
    
    const x1 = fRect.left + fRect.width / 2 - cRect.left;
    const y1 = fRect.top + fRect.height / 2 - cRect.top;
    const x2 = tRect.left + tRect.width / 2 - cRect.left;
    const y2 = tRect.top + tRect.height / 2 - cRect.top;
    
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;
    
    const curveOff = Math.min(dist * 0.25, 40);
    const nx = -dy / dist * curveOff;
    const ny = dx / dist * curveOff;
    const cx = (x1 + x2) / 2 + nx;
    const cy = (y1 + y2) / 2 + ny;
    
    const ns = 'http://www.w3.org/2000/svg';
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', 'M ' + x1 + ' ' + y1 + ' Q ' + cx + ' ' + cy + ' ' + x2 + ' ' + y2);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#0080ff');
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('stroke-opacity', '0.7');
    path.setAttribute('marker-end', 'url(#ah-' + svg.id + ')');
    svg.appendChild(path);
    
    const maxW = Math.max(x1, x2, cx) + 20;
    const maxH = Math.max(y1, y2, cy) + 20;
    svg.style.width = Math.max(parseFloat(svg.style.width) || 0, maxW) + 'px';
    svg.style.height = Math.max(parseFloat(svg.style.height) || 0, maxH) + 'px';
}

// ============ ZOOM ============
function setZoom(level) {
    zoomLevel = Math.max(0.4, Math.min(3, level));
    document.querySelectorAll('.table-inner-rel, #fixTable').forEach(el => {
        // CSS zoom keeps the table in normal layout flow, so sticky No cells
        // continue to work while the user changes the table size.
        el.style.zoom = zoomLevel;
        el.style.transform = 'none';
        el.style.transformOrigin = 'top left';
    });
}
