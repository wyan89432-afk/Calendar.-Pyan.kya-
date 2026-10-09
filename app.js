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
    render370RedTable();
    render370YellowTable();
    render460RedTable();
    render460YellowTable();
    render268RedTable();
    render268YellowTable();
    render907RedTable();
    render907YellowTable();
    render853RedTable();
    render853YellowTable();
    render500RedTable();
    render500YellowTable();
    render331RedTable();
    render331YellowTable();
    render782RedTable();
    render782YellowTable();
    render567RedTable();
    render567YellowTable();
}

function clearBlueHighlights() {
    document.querySelectorAll(
        '#greenTable td.match-found, #greenTable td.compare-source,' +
        '#yellowTable td.match-found, #yellowTable td.compare-source,' +
        '#red560Table td.match-found, #red560Table td.compare-source,' +
        '#yellow560Table td.match-found, #yellow560Table td.compare-source,' +
        '#red370Table td.match-found, #red370Table td.compare-source,' +
        '#yellow370Table td.match-found, #yellow370Table td.compare-source,' +
        '#red460Table td.match-found, #red460Table td.compare-source,' +
        '#yellow460Table td.match-found, #yellow460Table td.compare-source,' +
        '#red268Table td.match-found, #red268Table td.compare-source,' +
        '#yellow268Table td.match-found, #yellow268Table td.compare-source,' +
        '#red907Table td.match-found, #red907Table td.compare-source,' +
        '#yellow907Table td.match-found, #yellow907Table td.compare-source,' +
        '#red853Table td.match-found, #red853Table td.compare-source,' +
        '#yellow853Table td.match-found, #yellow853Table td.compare-source,' +
        '#red500Table td.match-found, #red500Table td.compare-source,' +
        '#yellow500Table td.match-found, #yellow500Table td.compare-source,' +
        '#red331Table td.match-found, #red331Table td.compare-source,' +
        '#yellow331Table td.match-found, #yellow331Table td.compare-source,' +
        '#red782Table td.match-found, #red782Table td.compare-source,' +
        '#yellow782Table td.match-found, #yellow782Table td.compare-source,' +
        '#red567Table td.match-found, #red567Table td.compare-source,' +
        '#yellow567Table td.match-found, #yellow567Table td.compare-source'
    ).forEach(cell => {
        cell.classList.remove('match-found', 'compare-source');
        cell.style.backgroundColor = '';
        cell.style.color = '';
        cell.style.border = '';
    });
}

function markBlueCell(cell) {
    if (!cell) return;
    cell.classList.add('match-found');
    cell.style.setProperty('background-color', '#0080ff', 'important');
    cell.style.setProperty('color', '#ffffff', 'important');
    cell.style.setProperty('border', '2px solid #0044cc', 'important');
}

function renderYellowSummary(summaryId, findNumber, foundInYellow) {
    const container = document.getElementById(summaryId);
    if (!container) return;

    const yellowValues = (foundInYellow || [])
        .map(match => String(match?.val ?? '').trim() || 'xxx');

    if (!String(findNumber ?? '').trim() || yellowValues.length === 0) {
        container.innerHTML =
            '<div class="yellow-summary-empty">No Blue-highlight result yet.</div>';
        return;
    }

    // One Find Number represents the complete Red permutation set.
    // All corresponding Yellow Blue-highlight values are listed together.
    const total = 1 + yellowValues.length;

    container.innerHTML =
        '<div class="yellow-summary-title">Summary</div>' +
        '<div class="yellow-summary-item">' +
        '<div><strong>Find Number = ' + String(findNumber).trim() + '</strong></div>' +
        '<div>Yellow Numbers = ' + yellowValues.join(', ') + '</div>' +
        '<div>Total = ' + total + '</div>' +
        '</div>';
}

function clearYellowSummaries() {
    document.querySelectorAll('.yellow-summary').forEach(container => {
        container.innerHTML = '';
    });
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
    render370RedTable();
    render370YellowTable();
    render460RedTable();
    render460YellowTable();
    render268RedTable();
    render268YellowTable();
    render907RedTable();
    render907YellowTable();
    render853RedTable();
    render853YellowTable();
    render500RedTable();
    render500YellowTable();
    render331RedTable();
    render331YellowTable();
    render782RedTable();
    render782YellowTable();
    render567RedTable();
    render567YellowTable();
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
    if (greenSrc) markBlueCell(greenSrc);

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
            if (gCell) markBlueCell(gCell);
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
        if (yCell) markBlueCell(yCell);

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

    renderYellowSummary('yellow540Summary', sourceVal, foundInYellow);

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
    if (sourceCell) markBlueCell(sourceCell);

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
            if (cell) markBlueCell(cell);
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

    renderYellowSummary('yellow560Summary', sourceVal, foundInYellow);

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


// ============ 907 TABLES ============
const GAP_907_BETWEEN = 302; // 302 cells are between the two positions
const GAP_907_OFFSET = GAP_907_BETWEEN + 1; // position-to-position distance = 303
const RED_907_START_HEADER = '08';
const YELLOW_907_START_HEADER = '10';

function render907RedTable() {
    const table = document.getElementById('red907Table');
    if (!table) return;

    const startCol = getHeaderIndex(RED_907_START_HEADER);
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
            html += '<td id="red907-r' + r + '-c' + c + '" class="' +
                (isEmpty ? 'xxx-cell' : '') + '">' +
                (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody>';
    table.innerHTML = html;
}

function render907YellowTable() {
    const table = document.getElementById('yellow907Table');
    if (!table) return;

    const startCol = getHeaderIndex(YELLOW_907_START_HEADER);
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
            html += '<td id="yellow907-r' + r + '-c' + c + '" class="' +
                (isEmpty ? 'xxx-cell' : '') + '">' +
                (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody>';
    table.innerHTML = html;
}

function runCompare907() {

    const redStart = getHeaderIndex(RED_907_START_HEADER);
    const yellowStart = getHeaderIndex(YELLOW_907_START_HEADER);
    const overallEnd = getLastUpdatedColumn(Math.min(redStart, yellowStart), tableHeaders.length - 1);

    if (redStart < 0 || yellowStart < 0 || overallEnd < redStart || ROWS <= 0) {
        return '<div class="note-item">907 data မရှိပါ။</div>';
    }

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
        return '<div class="note-item">907 last updated column မှ number မရှိပါ။</div>';
    }

    // 302 cells are between Red source and Yellow calculated position.
    const anchorLinear = toLinear560(lastUpdatedCol, anchorRow, redStart);
    const sourceLinear = anchorLinear - GAP_907_OFFSET;
    const sourcePos = fromLinear560(sourceLinear, redStart, lastUpdatedCol);

    if (!sourcePos || sourcePos.col < redStart) {
        return '<div class="note-item">907 gap 302 အတွက် Red source position မရှိပါ။</div>';
    }

    const sourceVal = tableData[sourcePos.row]?.[sourcePos.col] || '';
    if (!sourceVal.trim()) {
        return '<div class="note-item">907 gap 302 source number မရှိပါ။</div>';
    }

    const sourceCell = document.getElementById(
        'red907-r' + sourcePos.row + '-c' + sourcePos.col
    );
    if (sourceCell) markBlueCell(sourceCell);

    const perms = getPermutations(sourceVal);
    const foundInRed = [];

    // Search only in 907 Red: 91 -> last updated column, backward from source.
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
                'red907-r' + pos.row + '-c' + pos.col
            );
            if (cell) markBlueCell(cell);
        }
    }

    const foundInYellow = [];
    const arrowPairs = [];

    for (const match of foundInRed) {
        const yellowLinear = match.linear + GAP_907_OFFSET;
        const yPos = fromLinear560(yellowLinear, redStart, lastUpdatedCol);
        if (!yPos || yPos.col < yellowStart) continue;

        // Yellow is position-only; its number does not need to match Red.
        const yVal = tableData[yPos.row]?.[yPos.col] || '';
        const yCell = document.getElementById(
            'yellow907-r' + yPos.row + '-c' + yPos.col
        );

        if (yCell) markBlueCell(yCell);

        foundInYellow.push({
            col: yPos.col,
            row: yPos.row,
            val: yVal,
            sourceMatch: match
        });

        // Blue line inside the 907 Red table.
        arrowPairs.push({
            fromRow: sourcePos.row,
            fromCol: sourcePos.col,
            toRow: match.row,
            toCol: match.col,
            table: 'red907'
        });

        // Blue line inside the 907 Yellow table.
        arrowPairs.push({
            fromRow: anchorRow,
            fromCol: lastUpdatedCol,
            toRow: yPos.row,
            toCol: yPos.col,
            table: 'yellow907'
        });
    }

    renderYellowSummary('yellow907Summary', sourceVal, foundInYellow);

    const redList = foundInRed
        .map(m => m.val + '(R' + (m.row + 1) + ',C' + getHeaderDisplayName(m.col) + ')')
        .join(', ');

    const yellowList = foundInYellow
        .map(m => (m.val || 'blank') + '(R' + (m.row + 1) + ',C' + getHeaderDisplayName(m.col) + ')')
        .join(', ');

    if (foundInRed.length === 0) {
        return '<div class="note-item">907: Gap 302 အရ Red table မှာ permutation match မတွေ့ပါ။</div>';
    }

    drawArrows907(arrowPairs);

    const matchClass = foundInRed.length >= 3 ? 'match-3plus' : '';
    return '<div class="note-item ' + matchClass + '">' +
        '907 Last: C' + getHeaderDisplayName(lastUpdatedCol) + ' R' + (anchorRow + 1) +
        ' = ' + (tableData[anchorRow][lastUpdatedCol] || '') +
        ' | Gap: ' + GAP_907_BETWEEN +
        ' | Red Source: C' + getHeaderDisplayName(sourcePos.col) + ' R' + (sourcePos.row + 1) +
        ' = ' + sourceVal +
        ' | Perms: [' + perms.join(',') + ']' +
        ' | Found(' + foundInRed.length + '): ' + redList +
        ' | Yellow(Position only): ' + yellowList +
        '</div>';
}

function drawArrows907(pairs) {
    const redSvg = document.getElementById('red907Svg');
    const yellowSvg = document.getElementById('yellow907Svg');
    if (!redSvg || !yellowSvg) return;

    redSvg.innerHTML = '';
    yellowSvg.innerHTML = '';
    redSvg.style.width = '110%';
    redSvg.style.height = '110%';
    yellowSvg.style.width = '110%';
    yellowSvg.style.height = '110%';

    addArrowDefs(redSvg);
    addArrowDefs(yellowSvg);

    for (const pair of pairs) {
        if (pair.table === 'red907') {
            drawOneArrow('red907', redSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        } else if (pair.table === 'yellow907') {
            drawOneArrow('yellow907', yellowSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        }
    }
}
// ============ 853 TABLES ============
const GAP_853_BETWEEN = 382; // 382 cells are between the two positions
const GAP_853_OFFSET = GAP_853_BETWEEN + 1; // position-to-position distance = 383
const RED_853_START_HEADER = '00';
const YELLOW_853_START_HEADER = '10';

function render853RedTable() {
    const table = document.getElementById('red853Table');
    if (!table) return;

    const startCol = getHeaderIndex(RED_853_START_HEADER);
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
            html += '<td id="red853-r' + r + '-c' + c + '" class="' +
                (isEmpty ? 'xxx-cell' : '') + '">' +
                (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody>';
    table.innerHTML = html;
}

function render853YellowTable() {
    const table = document.getElementById('yellow853Table');
    if (!table) return;

    const startCol = getHeaderIndex(YELLOW_853_START_HEADER);
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
            html += '<td id="yellow853-r' + r + '-c' + c + '" class="' +
                (isEmpty ? 'xxx-cell' : '') + '">' +
                (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody>';
    table.innerHTML = html;
}

function runCompare853() {

    const redStart = getHeaderIndex(RED_853_START_HEADER);
    const yellowStart = getHeaderIndex(YELLOW_853_START_HEADER);
    const overallEnd = getLastUpdatedColumn(Math.min(redStart, yellowStart), tableHeaders.length - 1);

    if (redStart < 0 || yellowStart < 0 || overallEnd < redStart || ROWS <= 0) {
        return '<div class="note-item">853 data မရှိပါ။</div>';
    }

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
        return '<div class="note-item">853 last updated column မှ number မရှိပါ။</div>';
    }

    // 382 cells are between Red source and Yellow calculated position.
    const anchorLinear = toLinear560(lastUpdatedCol, anchorRow, redStart);
    const sourceLinear = anchorLinear - GAP_853_OFFSET;
    const sourcePos = fromLinear560(sourceLinear, redStart, lastUpdatedCol);

    if (!sourcePos || sourcePos.col < redStart) {
        return '<div class="note-item">853 gap 382 အတွက် Red source position မရှိပါ။</div>';
    }

    const sourceVal = tableData[sourcePos.row]?.[sourcePos.col] || '';
    if (!sourceVal.trim()) {
        return '<div class="note-item">853 gap 382 source number မရှိပါ။</div>';
    }

    const sourceCell = document.getElementById(
        'red853-r' + sourcePos.row + '-c' + sourcePos.col
    );
    if (sourceCell) markBlueCell(sourceCell);

    const perms = getPermutations(sourceVal);
    const foundInRed = [];

    // Search only in 853 Red: 00 -> last updated column, backward from source.
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
                'red853-r' + pos.row + '-c' + pos.col
            );
            if (cell) markBlueCell(cell);
        }
    }

    const foundInYellow = [];
    const arrowPairs = [];

    for (const match of foundInRed) {
        const yellowLinear = match.linear + GAP_853_OFFSET;
        const yPos = fromLinear560(yellowLinear, redStart, lastUpdatedCol);
        if (!yPos || yPos.col < yellowStart) continue;

        // Yellow is position-only; its number does not need to match Red.
        const yVal = tableData[yPos.row]?.[yPos.col] || '';
        const yCell = document.getElementById(
            'yellow853-r' + yPos.row + '-c' + yPos.col
        );

        if (yCell) markBlueCell(yCell);

        foundInYellow.push({
            col: yPos.col,
            row: yPos.row,
            val: yVal,
            sourceMatch: match
        });

        // Blue line inside the 853 Red table.
        arrowPairs.push({
            fromRow: sourcePos.row,
            fromCol: sourcePos.col,
            toRow: match.row,
            toCol: match.col,
            table: 'red853'
        });

        // Blue line inside the 853 Yellow table.
        arrowPairs.push({
            fromRow: anchorRow,
            fromCol: lastUpdatedCol,
            toRow: yPos.row,
            toCol: yPos.col,
            table: 'yellow853'
        });
    }

    renderYellowSummary('yellow853Summary', sourceVal, foundInYellow);

    const redList = foundInRed
        .map(m => m.val + '(R' + (m.row + 1) + ',C' + getHeaderDisplayName(m.col) + ')')
        .join(', ');

    const yellowList = foundInYellow
        .map(m => (m.val || 'blank') + '(R' + (m.row + 1) + ',C' + getHeaderDisplayName(m.col) + ')')
        .join(', ');

    if (foundInRed.length === 0) {
        return '<div class="note-item">853: Gap 382 အရ Red table မှာ permutation match မတွေ့ပါ။</div>';
    }

    drawArrows853(arrowPairs);

    const matchClass = foundInRed.length >= 3 ? 'match-3plus' : '';
    return '<div class="note-item ' + matchClass + '">' +
        '853 Last: C' + getHeaderDisplayName(lastUpdatedCol) + ' R' + (anchorRow + 1) +
        ' = ' + (tableData[anchorRow][lastUpdatedCol] || '') +
        ' | Gap: ' + GAP_853_BETWEEN +
        ' | Red Source: C' + getHeaderDisplayName(sourcePos.col) + ' R' + (sourcePos.row + 1) +
        ' = ' + sourceVal +
        ' | Perms: [' + perms.join(',') + ']' +
        ' | Found(' + foundInRed.length + '): ' + redList +
        ' | Yellow(Position only): ' + yellowList +
        '</div>';
}

function drawArrows853(pairs) {
    const redSvg = document.getElementById('red853Svg');
    const yellowSvg = document.getElementById('yellow853Svg');
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
        if (pair.table === 'red853') {
            drawOneArrow('red853', redSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        } else if (pair.table === 'yellow853') {
            drawOneArrow('yellow853', yellowSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        }
    }
}



// ============ 500 TABLES ============
const GAP_500_BETWEEN = 235; // 235 cells are between the two positions
const GAP_500_OFFSET = GAP_500_BETWEEN + 1; // position-to-position distance = 236
const RED_500_START_HEADER = '93';
const YELLOW_500_START_HEADER = '03';

function render500RedTable() {
    const table = document.getElementById('red500Table');
    if (!table) return;

    const startCol = getHeaderIndex(RED_500_START_HEADER);
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
            html += '<td id="red500-r' + r + '-c' + c + '" class="' +
                (isEmpty ? 'xxx-cell' : '') + '">' +
                (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody>';
    table.innerHTML = html;
}

function render500YellowTable() {
    const table = document.getElementById('yellow500Table');
    if (!table) return;

    const startCol = getHeaderIndex(YELLOW_500_START_HEADER);
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
            html += '<td id="yellow500-r' + r + '-c' + c + '" class="' +
                (isEmpty ? 'xxx-cell' : '') + '">' +
                (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody>';
    table.innerHTML = html;
}

function runCompare500() {

    const redStart = getHeaderIndex(RED_500_START_HEADER);
    const yellowStart = getHeaderIndex(YELLOW_500_START_HEADER);
    const overallEnd = getLastUpdatedColumn(Math.min(redStart, yellowStart), tableHeaders.length - 1);

    if (redStart < 0 || yellowStart < 0 || overallEnd < redStart || ROWS <= 0) {
        return '<div class="note-item">500 data မရှိပါ။</div>';
    }

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
        return '<div class="note-item">500 last updated column မှ number မရှိပါ။</div>';
    }

    // 235 cells are between Red source and Yellow calculated position.
    const anchorLinear = toLinear560(lastUpdatedCol, anchorRow, redStart);
    const sourceLinear = anchorLinear - GAP_500_OFFSET;
    const sourcePos = fromLinear560(sourceLinear, redStart, lastUpdatedCol);

    if (!sourcePos || sourcePos.col < redStart) {
        return '<div class="note-item">500 gap 235 အတွက် Red source position မရှိပါ။</div>';
    }

    const sourceVal = tableData[sourcePos.row]?.[sourcePos.col] || '';
    if (!sourceVal.trim()) {
        return '<div class="note-item">500 gap 235 source number မရှိပါ။</div>';
    }

    const sourceCell = document.getElementById(
        'red500-r' + sourcePos.row + '-c' + sourcePos.col
    );
    if (sourceCell) markBlueCell(sourceCell);

    const perms = getPermutations(sourceVal);
    const foundInRed = [];

    // Search only in 500 Red: 93 -> last updated column, backward from source.
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
                'red500-r' + pos.row + '-c' + pos.col
            );
            if (cell) markBlueCell(cell);
        }
    }

    const foundInYellow = [];
    const arrowPairs = [];

    for (const match of foundInRed) {
        const yellowLinear = match.linear + GAP_500_OFFSET;
        const yPos = fromLinear560(yellowLinear, redStart, lastUpdatedCol);
        if (!yPos || yPos.col < yellowStart) continue;

        // Yellow is position-only; its number does not need to match Red.
        const yVal = tableData[yPos.row]?.[yPos.col] || '';
        const yCell = document.getElementById(
            'yellow500-r' + yPos.row + '-c' + yPos.col
        );

        if (yCell) markBlueCell(yCell);

        foundInYellow.push({
            col: yPos.col,
            row: yPos.row,
            val: yVal,
            sourceMatch: match
        });

        // Blue line inside the 500 Red table.
        arrowPairs.push({
            fromRow: sourcePos.row,
            fromCol: sourcePos.col,
            toRow: match.row,
            toCol: match.col,
            table: 'red500'
        });

        // Blue line inside the 500 Yellow table.
        arrowPairs.push({
            fromRow: anchorRow,
            fromCol: lastUpdatedCol,
            toRow: yPos.row,
            toCol: yPos.col,
            table: 'yellow500'
        });
    }

    renderYellowSummary('yellow500Summary', sourceVal, foundInYellow);

    const redList = foundInRed
        .map(m => m.val + '(R' + (m.row + 1) + ',C' + getHeaderDisplayName(m.col) + ')')
        .join(', ');

    const yellowList = foundInYellow
        .map(m => (m.val || 'blank') + '(R' + (m.row + 1) + ',C' + getHeaderDisplayName(m.col) + ')')
        .join(', ');

    if (foundInRed.length === 0) {
        return '<div class="note-item">500: Gap 235 အရ Red table မှာ permutation match မတွေ့ပါ။</div>';
    }

    drawArrows500(arrowPairs);

    const matchClass = foundInRed.length >= 3 ? 'match-3plus' : '';
    return '<div class="note-item ' + matchClass + '">' +
        '500 Last: C' + getHeaderDisplayName(lastUpdatedCol) + ' R' + (anchorRow + 1) +
        ' = ' + (tableData[anchorRow][lastUpdatedCol] || '') +
        ' | Gap: ' + GAP_500_BETWEEN +
        ' | Red Source: C' + getHeaderDisplayName(sourcePos.col) + ' R' + (sourcePos.row + 1) +
        ' = ' + sourceVal +
        ' | Perms: [' + perms.join(',') + ']' +
        ' | Found(' + foundInRed.length + '): ' + redList +
        ' | Yellow(Position only): ' + yellowList +
        '</div>';
}

function drawArrows500(pairs) {
    const redSvg = document.getElementById('red500Svg');
    const yellowSvg = document.getElementById('yellow500Svg');
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
        if (pair.table === 'red500') {
            drawOneArrow('red500', redSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        } else if (pair.table === 'yellow500') {
            drawOneArrow('yellow500', yellowSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        }
    }
}




// ============ 331 TABLES ============
const GAP_331_BETWEEN = 193; // 193 cells are between the two positions
const GAP_331_OFFSET = GAP_331_BETWEEN + 1; // position-to-position distance = 194
const RED_331_START_HEADER = '00';
const YELLOW_331_START_HEADER = '18';

function render331RedTable() {
    const table = document.getElementById('red331Table');
    if (!table) return;

    const startCol = getHeaderIndex(RED_331_START_HEADER);
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
            html += '<td id="red331-r' + r + '-c' + c + '" class="' +
                (isEmpty ? 'xxx-cell' : '') + '">' +
                (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody>';
    table.innerHTML = html;
}

function render331YellowTable() {
    const table = document.getElementById('yellow331Table');
    if (!table) return;

    const startCol = getHeaderIndex(YELLOW_331_START_HEADER);
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
            html += '<td id="yellow331-r' + r + '-c' + c + '" class="' +
                (isEmpty ? 'xxx-cell' : '') + '">' +
                (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody>';
    table.innerHTML = html;
}

function runCompare331() {

    const redStart = getHeaderIndex(RED_331_START_HEADER);
    const yellowStart = getHeaderIndex(YELLOW_331_START_HEADER);
    const overallEnd = getLastUpdatedColumn(Math.min(redStart, yellowStart), tableHeaders.length - 1);

    if (redStart < 0 || yellowStart < 0 || overallEnd < redStart || ROWS <= 0) {
        return '<div class="note-item">331 data မရှိပါ။</div>';
    }

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
        return '<div class="note-item">331 last updated column မှ number မရှိပါ။</div>';
    }

    // 193 cells are between Red source and Yellow calculated position.
    const anchorLinear = toLinear560(lastUpdatedCol, anchorRow, redStart);
    const sourceLinear = anchorLinear - GAP_331_OFFSET;
    const sourcePos = fromLinear560(sourceLinear, redStart, lastUpdatedCol);

    if (!sourcePos || sourcePos.col < redStart) {
        return '<div class="note-item">331 gap 193 အတွက် Red source position မရှိပါ။</div>';
    }

    const sourceVal = tableData[sourcePos.row]?.[sourcePos.col] || '';
    if (!sourceVal.trim()) {
        return '<div class="note-item">331 gap 193 source number မရှိပါ။</div>';
    }

    const sourceCell = document.getElementById(
        'red331-r' + sourcePos.row + '-c' + sourcePos.col
    );
    if (sourceCell) markBlueCell(sourceCell);

    const perms = getPermutations(sourceVal);
    const foundInRed = [];

    // Search only in 331 Red: 00 -> last updated column, backward from source.
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
                'red331-r' + pos.row + '-c' + pos.col
            );
            if (cell) markBlueCell(cell);
        }
    }

    const foundInYellow = [];
    const arrowPairs = [];

    for (const match of foundInRed) {
        const yellowLinear = match.linear + GAP_331_OFFSET;
        const yPos = fromLinear560(yellowLinear, redStart, lastUpdatedCol);
        if (!yPos || yPos.col < yellowStart) continue;

        // Yellow is position-only; its number does not need to match Red.
        const yVal = tableData[yPos.row]?.[yPos.col] || '';
        const yCell = document.getElementById(
            'yellow331-r' + yPos.row + '-c' + yPos.col
        );

        if (yCell) markBlueCell(yCell);

        foundInYellow.push({
            col: yPos.col,
            row: yPos.row,
            val: yVal,
            sourceMatch: match
        });

        // Blue line inside the 331 Red table.
        arrowPairs.push({
            fromRow: sourcePos.row,
            fromCol: sourcePos.col,
            toRow: match.row,
            toCol: match.col,
            table: 'red331'
        });

        // Blue line inside the 331 Yellow table.
        arrowPairs.push({
            fromRow: anchorRow,
            fromCol: lastUpdatedCol,
            toRow: yPos.row,
            toCol: yPos.col,
            table: 'yellow331'
        });
    }

    renderYellowSummary('yellow331Summary', sourceVal, foundInYellow);

    const redList = foundInRed
        .map(m => m.val + '(R' + (m.row + 1) + ',C' + getHeaderDisplayName(m.col) + ')')
        .join(', ');

    const yellowList = foundInYellow
        .map(m => (m.val || 'blank') + '(R' + (m.row + 1) + ',C' + getHeaderDisplayName(m.col) + ')')
        .join(', ');

    if (foundInRed.length === 0) {
        return '<div class="note-item">331: Gap 193 အရ Red table မှာ permutation match မတွေ့ပါ။</div>';
    }

    drawArrows331(arrowPairs);

    const matchClass = foundInRed.length >= 3 ? 'match-3plus' : '';
    return '<div class="note-item ' + matchClass + '">' +
        '331 Last: C' + getHeaderDisplayName(lastUpdatedCol) + ' R' + (anchorRow + 1) +
        ' = ' + (tableData[anchorRow][lastUpdatedCol] || '') +
        ' | Gap: ' + GAP_331_BETWEEN +
        ' | Red Source: C' + getHeaderDisplayName(sourcePos.col) + ' R' + (sourcePos.row + 1) +
        ' = ' + sourceVal +
        ' | Perms: [' + perms.join(',') + ']' +
        ' | Found(' + foundInRed.length + '): ' + redList +
        ' | Yellow(Position only): ' + yellowList +
        '</div>';
}

function drawArrows331(pairs) {
    const redSvg = document.getElementById('red331Svg');
    const yellowSvg = document.getElementById('yellow331Svg');
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
        if (pair.table === 'red331') {
            drawOneArrow('red331', redSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        } else if (pair.table === 'yellow331') {
            drawOneArrow('yellow331', yellowSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        }
    }
}





// ============ 782 TABLES ============
const GAP_782_BETWEEN = 213; // 213 cells are between the two positions
const GAP_782_OFFSET = GAP_782_BETWEEN + 1; // position-to-position distance = 214
const RED_782_START_HEADER = '10';
const YELLOW_782_START_HEADER = '19';

function render782RedTable() {
    const table = document.getElementById('red782Table');
    if (!table) return;

    const startCol = getHeaderIndex(RED_782_START_HEADER);
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
            html += '<td id="red782-r' + r + '-c' + c + '" class="' +
                (isEmpty ? 'xxx-cell' : '') + '">' +
                (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody>';
    table.innerHTML = html;
}

function render782YellowTable() {
    const table = document.getElementById('yellow782Table');
    if (!table) return;

    const startCol = getHeaderIndex(YELLOW_782_START_HEADER);
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
            html += '<td id="yellow782-r' + r + '-c' + c + '" class="' +
                (isEmpty ? 'xxx-cell' : '') + '">' +
                (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody>';
    table.innerHTML = html;
}

function runCompare782() {

    const redStart = getHeaderIndex(RED_782_START_HEADER);
    const yellowStart = getHeaderIndex(YELLOW_782_START_HEADER);
    const overallEnd = getLastUpdatedColumn(Math.min(redStart, yellowStart), tableHeaders.length - 1);

    if (redStart < 0 || yellowStart < 0 || overallEnd < redStart || ROWS <= 0) {
        return '<div class="note-item">782 data မရှိပါ။</div>';
    }

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
        return '<div class="note-item">782 last updated column မှ number မရှိပါ။</div>';
    }

    // 213 cells are between Red source and Yellow calculated position.
    const anchorLinear = toLinear560(lastUpdatedCol, anchorRow, redStart);
    const sourceLinear = anchorLinear - GAP_782_OFFSET;
    const sourcePos = fromLinear560(sourceLinear, redStart, lastUpdatedCol);

    if (!sourcePos || sourcePos.col < redStart) {
        return '<div class="note-item">782 gap 213 အတွက် Red source position မရှိပါ။</div>';
    }

    const sourceVal = tableData[sourcePos.row]?.[sourcePos.col] || '';
    if (!sourceVal.trim()) {
        return '<div class="note-item">782 gap 213 source number မရှိပါ။</div>';
    }

    const sourceCell = document.getElementById(
        'red782-r' + sourcePos.row + '-c' + sourcePos.col
    );
    if (sourceCell) markBlueCell(sourceCell);

    const perms = getPermutations(sourceVal);
    const foundInRed = [];

    // Search only in 782 Red: 00 -> last updated column, backward from source.
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
                'red782-r' + pos.row + '-c' + pos.col
            );
            if (cell) markBlueCell(cell);
        }
    }

    const foundInYellow = [];
    const arrowPairs = [];

    for (const match of foundInRed) {
        const yellowLinear = match.linear + GAP_782_OFFSET;
        const yPos = fromLinear560(yellowLinear, redStart, lastUpdatedCol);
        if (!yPos || yPos.col < yellowStart) continue;

        // Yellow is position-only; its number does not need to match Red.
        const yVal = tableData[yPos.row]?.[yPos.col] || '';
        const yCell = document.getElementById(
            'yellow782-r' + yPos.row + '-c' + yPos.col
        );

        if (yCell) markBlueCell(yCell);

        foundInYellow.push({
            col: yPos.col,
            row: yPos.row,
            val: yVal,
            sourceMatch: match
        });

        // Blue line inside the 782 Red table.
        arrowPairs.push({
            fromRow: sourcePos.row,
            fromCol: sourcePos.col,
            toRow: match.row,
            toCol: match.col,
            table: 'red782'
        });

        // Blue line inside the 782 Yellow table.
        arrowPairs.push({
            fromRow: anchorRow,
            fromCol: lastUpdatedCol,
            toRow: yPos.row,
            toCol: yPos.col,
            table: 'yellow782'
        });
    }

    renderYellowSummary('yellow782Summary', sourceVal, foundInYellow);

    const redList = foundInRed
        .map(m => m.val + '(R' + (m.row + 1) + ',C' + getHeaderDisplayName(m.col) + ')')
        .join(', ');

    const yellowList = foundInYellow
        .map(m => (m.val || 'blank') + '(R' + (m.row + 1) + ',C' + getHeaderDisplayName(m.col) + ')')
        .join(', ');

    if (foundInRed.length === 0) {
        return '<div class="note-item">782: Gap 213 အရ Red table မှာ permutation match မတွေ့ပါ။</div>';
    }

    drawArrows782(arrowPairs);

    const matchClass = foundInRed.length >= 3 ? 'match-3plus' : '';
    return '<div class="note-item ' + matchClass + '">' +
        '782 Last: C' + getHeaderDisplayName(lastUpdatedCol) + ' R' + (anchorRow + 1) +
        ' = ' + (tableData[anchorRow][lastUpdatedCol] || '') +
        ' | Gap: ' + GAP_782_BETWEEN +
        ' | Red Source: C' + getHeaderDisplayName(sourcePos.col) + ' R' + (sourcePos.row + 1) +
        ' = ' + sourceVal +
        ' | Perms: [' + perms.join(',') + ']' +
        ' | Found(' + foundInRed.length + '): ' + redList +
        ' | Yellow(Position only): ' + yellowList +
        '</div>';
}

function drawArrows782(pairs) {
    const redSvg = document.getElementById('red782Svg');
    const yellowSvg = document.getElementById('yellow782Svg');
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
        if (pair.table === 'red782') {
            drawOneArrow('red782', redSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        } else if (pair.table === 'yellow782') {
            drawOneArrow('yellow782', yellowSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        }
    }
}






// ============ 567 TABLES ============
const GAP_567_BETWEEN = 190; // 190 cells are between the two positions
const GAP_567_OFFSET = GAP_567_BETWEEN + 1; // position-to-position distance = 191
const RED_567_START_HEADER = '10';
const YELLOW_567_START_HEADER = '19';

function render567RedTable() {
    const table = document.getElementById('red567Table');
    if (!table) return;

    const startCol = getHeaderIndex(RED_567_START_HEADER);
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
            html += '<td id="red567-r' + r + '-c' + c + '" class="' +
                (isEmpty ? 'xxx-cell' : '') + '">' +
                (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody>';
    table.innerHTML = html;
}

function render567YellowTable() {
    const table = document.getElementById('yellow567Table');
    if (!table) return;

    const startCol = getHeaderIndex(YELLOW_567_START_HEADER);
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
            html += '<td id="yellow567-r' + r + '-c' + c + '" class="' +
                (isEmpty ? 'xxx-cell' : '') + '">' +
                (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody>';
    table.innerHTML = html;
}

function runCompare567() {

    const redStart = getHeaderIndex(RED_567_START_HEADER);
    const yellowStart = getHeaderIndex(YELLOW_567_START_HEADER);
    const overallEnd = getLastUpdatedColumn(Math.min(redStart, yellowStart), tableHeaders.length - 1);

    if (redStart < 0 || yellowStart < 0 || overallEnd < redStart || ROWS <= 0) {
        return '<div class="note-item">567 data မရှိပါ။</div>';
    }

    const lastUpdatedCol = overallEnd;
    // Yellow anchor from Fix Table: C22, Row 21 = 789.
    const anchorCol = getHeaderIndex('22');
    const anchorRow = 20;

    if (anchorCol < yellowStart || anchorCol > lastUpdatedCol ||
        !String(tableData[anchorRow]?.[anchorCol] || '').trim()) {
        return '<div class="note-item">567 Yellow anchor C22 R21 မှ number မရှိပါ။</div>';
    }

    // 190 cells lie between Red C14 R22 (449) and Yellow C22 R21 (789).
    // Position-to-position distance = 191 cells.
    const anchorLinear = toLinear560(anchorCol, anchorRow, redStart);
    const sourceLinear = anchorLinear - GAP_567_OFFSET;
    const sourcePos = fromLinear560(sourceLinear, redStart, lastUpdatedCol);

    if (!sourcePos || sourcePos.col < redStart) {
        return '<div class="note-item">567 gap 213 အတွက် Red source position မရှိပါ။</div>';
    }

    const sourceVal = tableData[sourcePos.row]?.[sourcePos.col] || '';
    if (!sourceVal.trim()) {
        return '<div class="note-item">567 gap 213 source number မရှိပါ။</div>';
    }

    const sourceCell = document.getElementById(
        'red567-r' + sourcePos.row + '-c' + sourcePos.col
    );
    if (sourceCell) markBlueCell(sourceCell);

    const perms = getPermutations(sourceVal);
    const foundInRed = [];

    // Search only in 567 Red: 00 -> last updated column, backward from source.
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
                'red567-r' + pos.row + '-c' + pos.col
            );
            if (cell) markBlueCell(cell);
        }
    }

    const foundInYellow = [];
    const arrowPairs = [];

    for (const match of foundInRed) {
        const yellowLinear = match.linear + GAP_567_OFFSET;
        const yPos = fromLinear560(yellowLinear, redStart, lastUpdatedCol);
        if (!yPos || yPos.col < yellowStart) continue;

        // Yellow is position-only; its number does not need to match Red.
        const yVal = tableData[yPos.row]?.[yPos.col] || '';
        const yCell = document.getElementById(
            'yellow567-r' + yPos.row + '-c' + yPos.col
        );

        if (yCell) markBlueCell(yCell);

        foundInYellow.push({
            col: yPos.col,
            row: yPos.row,
            val: yVal,
            sourceMatch: match
        });

        // Blue line inside the 567 Red table.
        arrowPairs.push({
            fromRow: sourcePos.row,
            fromCol: sourcePos.col,
            toRow: match.row,
            toCol: match.col,
            table: 'red567'
        });

        // Blue line inside the 567 Yellow table.
        arrowPairs.push({
            fromRow: anchorRow,
            fromCol: lastUpdatedCol,
            toRow: yPos.row,
            toCol: yPos.col,
            table: 'yellow567'
        });
    }

    renderYellowSummary('yellow567Summary', sourceVal, foundInYellow);

    const redList = foundInRed
        .map(m => m.val + '(R' + (m.row + 1) + ',C' + getHeaderDisplayName(m.col) + ')')
        .join(', ');

    const yellowList = foundInYellow
        .map(m => (m.val || 'blank') + '(R' + (m.row + 1) + ',C' + getHeaderDisplayName(m.col) + ')')
        .join(', ');

    if (foundInRed.length === 0) {
        return '<div class="note-item">567: Gap 213 အရ Red table မှာ permutation match မတွေ့ပါ။</div>';
    }

    drawArrows567(arrowPairs);

    const matchClass = foundInRed.length >= 3 ? 'match-3plus' : '';
    return '<div class="note-item ' + matchClass + '">' +
        '567 Last: C' + getHeaderDisplayName(lastUpdatedCol) + ' R' + (anchorRow + 1) +
        ' = ' + (tableData[anchorRow][lastUpdatedCol] || '') +
        ' | Gap: ' + GAP_567_BETWEEN +
        ' | Red Source: C' + getHeaderDisplayName(sourcePos.col) + ' R' + (sourcePos.row + 1) +
        ' = ' + sourceVal +
        ' | Perms: [' + perms.join(',') + ']' +
        ' | Found(' + foundInRed.length + '): ' + redList +
        ' | Yellow(Position only): ' + yellowList +
        '</div>';
}

function drawArrows567(pairs) {
    const redSvg = document.getElementById('red567Svg');
    const yellowSvg = document.getElementById('yellow567Svg');
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
        if (pair.table === 'red567') {
            drawOneArrow('red567', redSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        } else if (pair.table === 'yellow567') {
            drawOneArrow('yellow567', yellowSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        }
    }
}






// ============ 268 TABLES ============
const GAP_268_BETWEEN = 431; // 431 cells are between the two positions
const GAP_268_OFFSET = GAP_268_BETWEEN + 1; // position-to-position distance = 432
const RED_268_START_HEADER = '84';
const YELLOW_268_START_HEADER = '00';

function render268RedTable() {
    const table = document.getElementById('red268Table');
    if (!table) return;

    const startCol = getHeaderIndex(RED_268_START_HEADER);
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
            html += '<td id="red268-r' + r + '-c' + c + '" class="' +
                (isEmpty ? 'xxx-cell' : '') + '">' +
                (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody>';
    table.innerHTML = html;
}

function render268YellowTable() {
    const table = document.getElementById('yellow268Table');
    if (!table) return;

    const startCol = getHeaderIndex(YELLOW_268_START_HEADER);
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
            html += '<td id="yellow268-r' + r + '-c' + c + '" class="' +
                (isEmpty ? 'xxx-cell' : '') + '">' +
                (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody>';
    table.innerHTML = html;
}

function runCompare268() {

    const redStart = getHeaderIndex(RED_268_START_HEADER);
    const yellowStart = getHeaderIndex(YELLOW_268_START_HEADER);
    const overallEnd = getLastUpdatedColumn(Math.min(redStart, yellowStart), tableHeaders.length - 1);

    if (redStart < 0 || yellowStart < 0 || overallEnd < redStart || ROWS <= 0) {
        return '<div class="note-item">268 data မရှိပါ။</div>';
    }

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
        return '<div class="note-item">268 last updated column မှ number မရှိပါ။</div>';
    }

    // 431 cells are between Red source and Yellow calculated position.
    const anchorLinear = toLinear560(lastUpdatedCol, anchorRow, redStart);
    const sourceLinear = anchorLinear - GAP_268_OFFSET;
    const sourcePos = fromLinear560(sourceLinear, redStart, lastUpdatedCol);

    if (!sourcePos || sourcePos.col < redStart) {
        return '<div class="note-item">268 gap 431 အတွက် Red source position မရှိပါ။</div>';
    }

    const sourceVal = tableData[sourcePos.row]?.[sourcePos.col] || '';
    if (!sourceVal.trim()) {
        return '<div class="note-item">268 gap 431 source number မရှိပါ။</div>';
    }

    const sourceCell = document.getElementById(
        'red268-r' + sourcePos.row + '-c' + sourcePos.col
    );
    if (sourceCell) markBlueCell(sourceCell);

    const perms = getPermutations(sourceVal);
    const foundInRed = [];

    // Search only in 268 Red: 91 -> last updated column, backward from source.
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
                'red268-r' + pos.row + '-c' + pos.col
            );
            if (cell) markBlueCell(cell);
        }
    }

    const foundInYellow = [];
    const arrowPairs = [];

    for (const match of foundInRed) {
        const yellowLinear = match.linear + GAP_268_OFFSET;
        const yPos = fromLinear560(yellowLinear, redStart, lastUpdatedCol);
        if (!yPos || yPos.col < yellowStart) continue;

        // Yellow is position-only; its number does not need to match Red.
        const yVal = tableData[yPos.row]?.[yPos.col] || '';
        const yCell = document.getElementById(
            'yellow268-r' + yPos.row + '-c' + yPos.col
        );

        if (yCell) markBlueCell(yCell);

        foundInYellow.push({
            col: yPos.col,
            row: yPos.row,
            val: yVal,
            sourceMatch: match
        });

        // Blue line inside the 268 Red table.
        arrowPairs.push({
            fromRow: sourcePos.row,
            fromCol: sourcePos.col,
            toRow: match.row,
            toCol: match.col,
            table: 'red268'
        });

        // Blue line inside the 268 Yellow table.
        arrowPairs.push({
            fromRow: anchorRow,
            fromCol: lastUpdatedCol,
            toRow: yPos.row,
            toCol: yPos.col,
            table: 'yellow268'
        });
    }

    renderYellowSummary('yellow268Summary', sourceVal, foundInYellow);

    const redList = foundInRed
        .map(m => m.val + '(R' + (m.row + 1) + ',C' + getHeaderDisplayName(m.col) + ')')
        .join(', ');

    const yellowList = foundInYellow
        .map(m => (m.val || 'blank') + '(R' + (m.row + 1) + ',C' + getHeaderDisplayName(m.col) + ')')
        .join(', ');

    if (foundInRed.length === 0) {
        return '<div class="note-item">268: Gap 431 အရ Red table မှာ permutation match မတွေ့ပါ။</div>';
    }

    drawArrows268(arrowPairs);

    const matchClass = foundInRed.length >= 3 ? 'match-3plus' : '';
    return '<div class="note-item ' + matchClass + '">' +
        '268 Last: C' + getHeaderDisplayName(lastUpdatedCol) + ' R' + (anchorRow + 1) +
        ' = ' + (tableData[anchorRow][lastUpdatedCol] || '') +
        ' | Gap: ' + GAP_268_BETWEEN +
        ' | Red Source: C' + getHeaderDisplayName(sourcePos.col) + ' R' + (sourcePos.row + 1) +
        ' = ' + sourceVal +
        ' | Perms: [' + perms.join(',') + ']' +
        ' | Found(' + foundInRed.length + '): ' + redList +
        ' | Yellow(Position only): ' + yellowList +
        '</div>';
}

function drawArrows268(pairs) {
    const redSvg = document.getElementById('red268Svg');
    const yellowSvg = document.getElementById('yellow268Svg');
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
        if (pair.table === 'red268') {
            drawOneArrow('red268', redSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        } else if (pair.table === 'yellow268') {
            drawOneArrow('yellow268', yellowSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        }
    }
}



// ============ 460 TABLES ============
const GAP_460_BETWEEN = 594; // 594 cells are between the two positions
const GAP_460_OFFSET = GAP_460_BETWEEN + 1; // position-to-position distance = 237
const RED_460_START_HEADER = '76';
const YELLOW_460_START_HEADER = '11';

function render460RedTable() {
    const table = document.getElementById('red460Table');
    if (!table) return;

    const startCol = getHeaderIndex(RED_460_START_HEADER);
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
            html += '<td id="red460-r' + r + '-c' + c + '" class="' +
                (isEmpty ? 'xxx-cell' : '') + '">' +
                (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody>';
    table.innerHTML = html;
}

function render460YellowTable() {
    const table = document.getElementById('yellow460Table');
    if (!table) return;

    const startCol = getHeaderIndex(YELLOW_460_START_HEADER);
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
            html += '<td id="yellow460-r' + r + '-c' + c + '" class="' +
                (isEmpty ? 'xxx-cell' : '') + '">' +
                (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody>';
    table.innerHTML = html;
}

function runCompare460() {

    const redStart = getHeaderIndex(RED_460_START_HEADER);
    const yellowStart = getHeaderIndex(YELLOW_460_START_HEADER);
    const overallEnd = getLastUpdatedColumn(Math.min(redStart, yellowStart), tableHeaders.length - 1);

    if (redStart < 0 || yellowStart < 0 || overallEnd < redStart || ROWS <= 0) {
        return '<div class="note-item">460 data မရှိပါ။</div>';
    }

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
        return '<div class="note-item">460 last updated column မှ number မရှိပါ။</div>';
    }

    // 594 cells are between Red source and Yellow calculated position.
    const anchorLinear = toLinear560(lastUpdatedCol, anchorRow, redStart);
    const sourceLinear = anchorLinear - GAP_460_OFFSET;
    const sourcePos = fromLinear560(sourceLinear, redStart, lastUpdatedCol);

    if (!sourcePos || sourcePos.col < redStart) {
        return '<div class="note-item">460 gap 594 အတွက် Red source position မရှိပါ။</div>';
    }

    const sourceVal = tableData[sourcePos.row]?.[sourcePos.col] || '';
    if (!sourceVal.trim()) {
        return '<div class="note-item">460 gap 594 source number မရှိပါ။</div>';
    }

    const sourceCell = document.getElementById(
        'red460-r' + sourcePos.row + '-c' + sourcePos.col
    );
    if (sourceCell) markBlueCell(sourceCell);

    const perms = getPermutations(sourceVal);
    const foundInRed = [];

    // Search only in 460 Red: 91 -> last updated column, backward from source.
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
                'red460-r' + pos.row + '-c' + pos.col
            );
            if (cell) markBlueCell(cell);
        }
    }

    const foundInYellow = [];
    const arrowPairs = [];

    for (const match of foundInRed) {
        const yellowLinear = match.linear + GAP_460_OFFSET;
        const yPos = fromLinear560(yellowLinear, redStart, lastUpdatedCol);
        if (!yPos || yPos.col < yellowStart) continue;

        // Yellow is position-only; its number does not need to match Red.
        const yVal = tableData[yPos.row]?.[yPos.col] || '';
        const yCell = document.getElementById(
            'yellow460-r' + yPos.row + '-c' + yPos.col
        );

        if (yCell) markBlueCell(yCell);

        foundInYellow.push({
            col: yPos.col,
            row: yPos.row,
            val: yVal,
            sourceMatch: match
        });

        // Blue line inside the 460 Red table.
        arrowPairs.push({
            fromRow: sourcePos.row,
            fromCol: sourcePos.col,
            toRow: match.row,
            toCol: match.col,
            table: 'red460'
        });

        // Blue line inside the 460 Yellow table.
        arrowPairs.push({
            fromRow: anchorRow,
            fromCol: lastUpdatedCol,
            toRow: yPos.row,
            toCol: yPos.col,
            table: 'yellow460'
        });
    }

    renderYellowSummary('yellow460Summary', sourceVal, foundInYellow);

    const redList = foundInRed
        .map(m => m.val + '(R' + (m.row + 1) + ',C' + getHeaderDisplayName(m.col) + ')')
        .join(', ');

    const yellowList = foundInYellow
        .map(m => (m.val || 'blank') + '(R' + (m.row + 1) + ',C' + getHeaderDisplayName(m.col) + ')')
        .join(', ');

    if (foundInRed.length === 0) {
        return '<div class="note-item">460: Gap 594 အရ Red table မှာ permutation match မတွေ့ပါ။</div>';
    }

    drawArrows460(arrowPairs);

    const matchClass = foundInRed.length >= 3 ? 'match-3plus' : '';
    return '<div class="note-item ' + matchClass + '">' +
        '460 Last: C' + getHeaderDisplayName(lastUpdatedCol) + ' R' + (anchorRow + 1) +
        ' = ' + (tableData[anchorRow][lastUpdatedCol] || '') +
        ' | Gap: ' + GAP_460_BETWEEN +
        ' | Red Source: C' + getHeaderDisplayName(sourcePos.col) + ' R' + (sourcePos.row + 1) +
        ' = ' + sourceVal +
        ' | Perms: [' + perms.join(',') + ']' +
        ' | Found(' + foundInRed.length + '): ' + redList +
        ' | Yellow(Position only): ' + yellowList +
        '</div>';
}

function drawArrows460(pairs) {
    const redSvg = document.getElementById('red460Svg');
    const yellowSvg = document.getElementById('yellow460Svg');
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
        if (pair.table === 'red460') {
            drawOneArrow('red460', redSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        } else if (pair.table === 'yellow460') {
            drawOneArrow('yellow460', yellowSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        }
    }
}


// ============ 370 TABLES ============
const GAP_370_BETWEEN = 236; // 236 cells are between the two positions
const GAP_370_OFFSET = GAP_370_BETWEEN + 1; // position-to-position distance = 237
const RED_370_START_HEADER = '91';
const YELLOW_370_START_HEADER = '11';

function render370RedTable() {
    const table = document.getElementById('red370Table');
    if (!table) return;

    const startCol = getHeaderIndex(RED_370_START_HEADER);
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
            html += '<td id="red370-r' + r + '-c' + c + '" class="' +
                (isEmpty ? 'xxx-cell' : '') + '">' +
                (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody>';
    table.innerHTML = html;
}

function render370YellowTable() {
    const table = document.getElementById('yellow370Table');
    if (!table) return;

    const startCol = getHeaderIndex(YELLOW_370_START_HEADER);
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
            html += '<td id="yellow370-r' + r + '-c' + c + '" class="' +
                (isEmpty ? 'xxx-cell' : '') + '">' +
                (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody>';
    table.innerHTML = html;
}

function runCompare370() {

    const redStart = getHeaderIndex(RED_370_START_HEADER);
    const yellowStart = getHeaderIndex(YELLOW_370_START_HEADER);
    const overallEnd = getLastUpdatedColumn(Math.min(redStart, yellowStart), tableHeaders.length - 1);

    if (redStart < 0 || yellowStart < 0 || overallEnd < redStart || ROWS <= 0) {
        return '<div class="note-item">370 data မရှိပါ။</div>';
    }

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
        return '<div class="note-item">370 last updated column မှ number မရှိပါ။</div>';
    }

    // 236 cells are between Red source and Yellow calculated position.
    const anchorLinear = toLinear560(lastUpdatedCol, anchorRow, redStart);
    const sourceLinear = anchorLinear - GAP_370_OFFSET;
    const sourcePos = fromLinear560(sourceLinear, redStart, lastUpdatedCol);

    if (!sourcePos || sourcePos.col < redStart) {
        return '<div class="note-item">370 gap 236 အတွက် Red source position မရှိပါ။</div>';
    }

    const sourceVal = tableData[sourcePos.row]?.[sourcePos.col] || '';
    if (!sourceVal.trim()) {
        return '<div class="note-item">370 gap 236 source number မရှိပါ။</div>';
    }

    const sourceCell = document.getElementById(
        'red370-r' + sourcePos.row + '-c' + sourcePos.col
    );
    if (sourceCell) markBlueCell(sourceCell);

    const perms = getPermutations(sourceVal);
    const foundInRed = [];

    // Search only in 370 Red: 91 -> last updated column, backward from source.
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
                'red370-r' + pos.row + '-c' + pos.col
            );
            if (cell) markBlueCell(cell);
        }
    }

    const foundInYellow = [];
    const arrowPairs = [];

    for (const match of foundInRed) {
        const yellowLinear = match.linear + GAP_370_OFFSET;
        const yPos = fromLinear560(yellowLinear, redStart, lastUpdatedCol);
        if (!yPos || yPos.col < yellowStart) continue;

        // Yellow is position-only; its number does not need to match Red.
        const yVal = tableData[yPos.row]?.[yPos.col] || '';
        const yCell = document.getElementById(
            'yellow370-r' + yPos.row + '-c' + yPos.col
        );

        if (yCell) markBlueCell(yCell);

        foundInYellow.push({
            col: yPos.col,
            row: yPos.row,
            val: yVal,
            sourceMatch: match
        });

        // Blue line inside the 370 Red table.
        arrowPairs.push({
            fromRow: sourcePos.row,
            fromCol: sourcePos.col,
            toRow: match.row,
            toCol: match.col,
            table: 'red370'
        });

        // Blue line inside the 370 Yellow table.
        arrowPairs.push({
            fromRow: anchorRow,
            fromCol: lastUpdatedCol,
            toRow: yPos.row,
            toCol: yPos.col,
            table: 'yellow370'
        });
    }

    renderYellowSummary('yellow370Summary', sourceVal, foundInYellow);

    const redList = foundInRed
        .map(m => m.val + '(R' + (m.row + 1) + ',C' + getHeaderDisplayName(m.col) + ')')
        .join(', ');

    const yellowList = foundInYellow
        .map(m => (m.val || 'blank') + '(R' + (m.row + 1) + ',C' + getHeaderDisplayName(m.col) + ')')
        .join(', ');

    if (foundInRed.length === 0) {
        return '<div class="note-item">370: Gap 236 အရ Red table မှာ permutation match မတွေ့ပါ။</div>';
    }

    drawArrows370(arrowPairs);

    const matchClass = foundInRed.length >= 3 ? 'match-3plus' : '';
    return '<div class="note-item ' + matchClass + '">' +
        '370 Last: C' + getHeaderDisplayName(lastUpdatedCol) + ' R' + (anchorRow + 1) +
        ' = ' + (tableData[anchorRow][lastUpdatedCol] || '') +
        ' | Gap: ' + GAP_370_BETWEEN +
        ' | Red Source: C' + getHeaderDisplayName(sourcePos.col) + ' R' + (sourcePos.row + 1) +
        ' = ' + sourceVal +
        ' | Perms: [' + perms.join(',') + ']' +
        ' | Found(' + foundInRed.length + '): ' + redList +
        ' | Yellow(Position only): ' + yellowList +
        '</div>';
}

function drawArrows370(pairs) {
    const redSvg = document.getElementById('red370Svg');
    const yellowSvg = document.getElementById('yellow370Svg');
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
        if (pair.table === 'red370') {
            drawOneArrow('red370', redSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        } else if (pair.table === 'yellow370') {
            drawOneArrow('yellow370', yellowSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
        }
    }
}

function runCompare() {
    // Render every comparison table once before calculating.
    // Individual compare functions must not re-render afterward,
    // otherwise the newly applied Blue highlights would be erased.
    renderAll();
    clearBlueHighlights();
    clearYellowSummaries();
    const noteSection = document.getElementById('noteSection');
    runCompare540();
    const note540 = noteSection.innerHTML;
    const result560 = runCompare560();
    const result370 = runCompare370();
    const result460 = runCompare460();
    const result268 = runCompare268();
    const result907 = runCompare907();
    const result853 = runCompare853();
    const result500 = runCompare500();
    const result331 = runCompare331();
    const result782 = runCompare782();
    const result567 = runCompare567();

    // Keep all comparison results together in the Notes section.
    noteSection.innerHTML =
        '<div class="compare-group"><div class="compare-group-title">540 Compare Result</div>' +
        note540 +
        '</div>' +
        '<div class="compare-group"><div class="compare-group-title">560 Compare Result</div>' +
        result560 +
        '</div>' +
        '<div class="compare-group"><div class="compare-group-title">370 Compare Result</div>' +
        result370 +
        '</div>' +
        '<div class="compare-group"><div class="compare-group-title">460 Compare Result</div>' +
        result460 +
        '</div>' +
        '<div class="compare-group"><div class="compare-group-title">268 Compare Result</div>' +
        result268 +
        '</div>' +
        '<div class="compare-group"><div class="compare-group-title">907 Compare Result</div>' +
        result907 +
        '</div>' +
        '<div class="compare-group"><div class="compare-group-title">853 Compare Result</div>' +
        result853 +
        '</div>' +
        '<div class="compare-group"><div class="compare-group-title">500 Compare Result</div>' +
        result500 +
        '</div>' +
        '<div class="compare-group"><div class="compare-group-title">331 Compare Result</div>' +
        result331 +
        '</div>' +
        '<div class="compare-group"><div class="compare-group-title">782 Compare Result</div>' +
        result782 +
        '</div>' +
        '<div class="compare-group"><div class="compare-group-title">567 Compare Result</div>' +
        result567 +
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
    document.querySelectorAll('.table-inner-rel, #fixTable, .reference-image-wrapper svg').forEach(el => {
        // CSS zoom keeps the table in normal layout flow, so sticky No cells
        // continue to work while the user changes the table size.
        el.style.zoom = zoomLevel;
        el.style.transform = 'none';
        el.style.transformOrigin = 'top left';
    });
}
