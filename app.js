// Calendar Pyan Kya
// Display columns start from index 31 (header "0") as display "00"

const DISPLAY_START_INDEX = 31;
let ROWS = Array.isArray(TABLE_DATA) ? TABLE_DATA.length : 24;
const SOURCE_ROWS_URL = 'https://raw.githubusercontent.com/wyan89432-afk/key_and_one_change/main/fixed-table.csv';
const GAP_ROWS = 131; // 5 col * 24 rows + 11 rows = 131

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

        ROWS = sourceRows;

        // Keep existing Calendar data; safely resize only the row container.
        const width = tableHeaders.length;
        if (tableData.length < ROWS) {
            while (tableData.length < ROWS) tableData.push(new Array(width).fill(''));
        } else if (tableData.length > ROWS) {
            tableData = tableData.slice(0, ROWS);
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
function runCompare() {
    renderGreenTable();
    renderYellowTable();
    
    const totalCols = getDisplayColCount();
    
    // Find last column with any data
    let lastFilledCol = -1;
    for (let c = totalCols - 1; c >= 0; c--) {
        for (let r = 0; r < ROWS; r++) {
            if (tableData[r][DISPLAY_START_INDEX + c] && tableData[r][DISPLAY_START_INDEX + c].trim() !== '') {
                lastFilledCol = c;
                break;
            }
        }
        if (lastFilledCol >= 0) break;
    }
    
    if (lastFilledCol < 0) {
        document.getElementById('noteSection').innerHTML = '<div class="note-item">Data မရှိပါ။</div>';
        return;
    }
    
    // Find last filled row in lastFilledCol
    let lastFilledRow = -1;
    for (let r = 0; r < ROWS; r++) {
        if (tableData[r][DISPLAY_START_INDEX + lastFilledCol] && tableData[r][DISPLAY_START_INDEX + lastFilledCol].trim() !== '') {
            lastFilledRow = r;
        }
    }
    
    // Blank rows in lastFilledCol
    const blankRows = [];
    for (let r = lastFilledRow + 1; r < ROWS; r++) {
        blankRows.push(r);
    }
    
    if (blankRows.length === 0) {
        document.getElementById('noteSection').innerHTML = '<div class="note-item">Blank row မရှိပါ။</div>';
        return;
    }
    
    const notes = [];
    const arrowPairs = [];
    
    for (const blankRow of blankRows) {
        // Blank position in linear
        const blankLinear = toLinear(lastFilledCol, blankRow);
        
        // Compare source = 131 rows BACK from blank position
        const sourceLinear = blankLinear - GAP_ROWS;
        const sourcePos = fromLinear(sourceLinear);
        if (!sourcePos) continue;
        
        const sourceVal = tableData[sourcePos.row][DISPLAY_START_INDEX + sourcePos.col] || '';
        if (!sourceVal || sourceVal.trim() === '') continue;
        
        // Highlight compare source in green table (red table)
        const greenSrc = document.getElementById('green-r' + sourcePos.row + '-c' + sourcePos.col);
        if (greenSrc) greenSrc.classList.add('compare-source');
        
        // Get permutations of source value
        const perms = getPermutations(sourceVal);
        
        // Search backward from sourcePos toward col 00 for permutations (in red/green table)
        const foundInRed = [];
        for (let searchLinear = sourceLinear - 1; searchLinear >= 0; searchLinear--) {
            const sPos = fromLinear(searchLinear);
            if (!sPos) continue;
            const cellVal = tableData[sPos.row][DISPLAY_START_INDEX + sPos.col] || '';
            if (cellVal && perms.includes(cellVal)) {
                foundInRed.push({ col: sPos.col, row: sPos.row, val: cellVal, linear: searchLinear });
                
                // Highlight in green table
                const gCell = document.getElementById('green-r' + sPos.row + '-c' + sPos.col);
                if (gCell) gCell.classList.add('match-found');
            }
        }
        
        // For each found match in red table, calculate 131 rows FORWARD to find position in yellow table
        const foundInYellow = [];
        for (const match of foundInRed) {
            const yellowLinear = match.linear + GAP_ROWS;
            const yPos = fromLinear(yellowLinear);
            if (!yPos) continue;
            
            const yVal = tableData[yPos.row][DISPLAY_START_INDEX + yPos.col] || '';
            foundInYellow.push({ col: yPos.col, row: yPos.row, val: yVal, sourceMatch: match });
            
            // Highlight in yellow table (if col >= 5)
            if (yPos.col >= 5) {
                const yCell = document.getElementById('yellow-r' + yPos.row + '-c' + yPos.col);
                if (yCell) yCell.classList.add('match-found');
            }
            
            // Arrow from source to found in red
            arrowPairs.push({
                fromRow: sourcePos.row, fromCol: sourcePos.col,
                toRow: match.row, toCol: match.col,
                table: 'green'
            });
            
            // Arrow in yellow table
            if (yPos.col >= 5) {
                arrowPairs.push({
                    fromRow: blankRow, fromCol: lastFilledCol,
                    toRow: yPos.row, toCol: yPos.col,
                    table: 'yellow'
                });
            }
        }
        
        // Add note - even 1 match
        if (foundInRed.length > 0) {
            const matchClass = foundInRed.length >= 3 ? 'match-3plus' : '';
            const redList = foundInRed.map(m => m.val + '(R' + (m.row+1) + ',C' + colName(m.col) + ')').join(', ');
            const yellowList = foundInYellow.map(m => 'C' + colName(m.col) + 'R' + (m.row+1)).join(', ');
            notes.push('<div class="note-item ' + matchClass + '">' +
                'Blank: C' + colName(lastFilledCol) + ' R' + (blankRow+1) + ' | ' +
                'Source: C' + colName(sourcePos.col) + ' R' + (sourcePos.row+1) + ' = ' + sourceVal + ' | ' +
                'Perms: [' + perms.join(',') + '] | ' +
                'Found(' + foundInRed.length + '): ' + redList + ' | ' +
                'Yellow: ' + yellowList + '</div>');
        }
    }
    
    // Render notes
    if (notes.length > 0) {
        document.getElementById('noteSection').innerHTML = notes.join('');
    } else {
        document.getElementById('noteSection').innerHTML = '<div class="note-item">Match မတွေ့ပါ။</div>';
    }
    
    // Draw arrows
    drawArrows(arrowPairs);
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
    poly.setAttribute('fill', '#00ff00');
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
    path.setAttribute('stroke', '#00ff00');
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
        el.style.transform = 'scale(' + zoomLevel + ')';
        el.style.transformOrigin = 'top left';
    });
}
