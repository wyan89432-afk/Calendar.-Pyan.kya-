// Calendar Pyan Kya - Main Application Logic
// Display columns start from index 31 (header "0") as display "00"

const DISPLAY_START_INDEX = 31;
let zoomLevel = 1;
let tableData = [];
let tableHeaders = [];
let addedColumns = [];

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderFixTable();
    renderGreenTable();
    renderYellowTable();
    
    document.getElementById('addColBtn').addEventListener('click', addColumn);
    document.getElementById('compareBtn').addEventListener('click', runCompare);
    document.getElementById('zoomIn').addEventListener('click', () => setZoom(zoomLevel + 0.1));
    document.getElementById('zoomOut').addEventListener('click', () => setZoom(zoomLevel - 0.1));
    document.getElementById('zoomReset').addEventListener('click', () => setZoom(1));
});

function loadData() {
    tableHeaders = [...TABLE_HEADERS];
    tableData = TABLE_DATA.map(row => [...row]);
    
    const saved = localStorage.getItem('calendarPyanKya_data');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.addedColumns) {
                addedColumns = parsed.addedColumns;
                for (const col of addedColumns) {
                    tableHeaders.push(col.name);
                    for (let r = 0; r < 24; r++) {
                        tableData[r].push(col.data[r] || '');
                    }
                }
            }
        } catch(e) {
            console.error('Error loading saved data:', e);
        }
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
    const newColData = new Array(24).fill('');
    for (let r = 0; r < 24; r++) {
        tableData[r].push('');
    }
    
    addedColumns.push({ name: newName, data: newColData });
    saveData();
    
    renderFixTable();
    renderGreenTable();
    renderYellowTable();
}

function getDisplayColCount() {
    return tableHeaders.length - DISPLAY_START_INDEX;
}

function getDisplayColName(idx) {
    return String(idx).padStart(2, '0');
}

// ============ FIX TABLE ============
function renderFixTable() {
    const table = document.getElementById('fixTable');
    const totalCols = getDisplayColCount();
    
    let html = '<thead><tr><th>No</th>';
    for (let c = 0; c < totalCols; c++) {
        html += '<th>' + getDisplayColName(c) + '</th>';
    }
    html += '</tr></thead><tbody>';
    
    for (let r = 0; r < 24; r++) {
        html += '<tr><td class="row-num">' + (r + 1) + '</td>';
        for (let c = 0; c < totalCols; c++) {
            const arrIdx = DISPLAY_START_INDEX + c;
            const val = tableData[r][arrIdx] || '';
            const isEmpty = val.trim() === '';
            const cls = isEmpty ? 'empty-cell' : '';
            html += '<td class="' + cls + '">';
            html += '<input type="text" maxlength="3" value="' + (isEmpty ? '' : val) + '" ';
            html += 'data-row="' + r + '" data-col="' + arrIdx + '" ';
            html += 'onchange="onCellEdit(this)" ';
            html += 'placeholder="' + (isEmpty ? 'xxx' : '') + '">';
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
    
    tableData[row][col] = val;
    
    const origLen = TABLE_HEADERS.length;
    if (col >= origLen) {
        const addedIdx = col - origLen;
        if (addedIdx < addedColumns.length) {
            addedColumns[addedIdx].data[row] = val;
        }
    }
    
    saveData();
    renderGreenTable();
    renderYellowTable();
}

// ============ GREEN/RED TABLE (Column 00 to Last) ============
function renderGreenTable() {
    const table = document.getElementById('greenTable');
    const totalCols = getDisplayColCount();
    
    let html = '<thead><tr><th>No</th>';
    for (let c = 0; c < totalCols; c++) {
        html += '<th>' + getDisplayColName(c) + '</th>';
    }
    html += '</tr></thead><tbody>';
    
    for (let r = 0; r < 24; r++) {
        html += '<tr><td class="row-num">' + (r + 1) + '</td>';
        for (let c = 0; c < totalCols; c++) {
            const arrIdx = DISPLAY_START_INDEX + c;
            const val = tableData[r][arrIdx] || '';
            const isEmpty = val.trim() === '';
            const cellId = 'green-r' + r + '-c' + c;
            const cls = isEmpty ? 'xxx-cell' : '';
            html += '<td id="' + cellId + '" class="' + cls + '">' + (isEmpty ? 'xxx' : val) + '</td>';
        }
        html += '</tr>';
    }
    html += '</tbody>';
    table.innerHTML = html;
}

// ============ YELLOW TABLE (Column 05 to Last) ============
function renderYellowTable() {
    const table = document.getElementById('yellowTable');
    const totalCols = getDisplayColCount();
    const startCol = 5;
    
    let html = '<thead><tr><th>No</th>';
    for (let c = startCol; c < totalCols; c++) {
        html += '<th>' + getDisplayColName(c) + '</th>';
    }
    html += '</tr></thead><tbody>';
    
    for (let r = 0; r < 24; r++) {
        html += '<tr><td class="row-num">' + (r + 1) + '</td>';
        for (let c = startCol; c < totalCols; c++) {
            const arrIdx = DISPLAY_START_INDEX + c;
            const val = tableData[r][arrIdx] || '';
            const isEmpty = val.trim() === '';
            const cellId = 'yellow-r' + r + '-c' + c;
            const cls = isEmpty ? 'xxx-cell' : '';
            html += '<td id="' + cellId + '" class="' + cls + '">' + (isEmpty ? 'xxx' : val) + '</td>';
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
    
    // Find the last column (display col) that has ANY data
    let lastFilledCol = -1;
    for (let c = totalCols - 1; c >= 0; c--) {
        const arrIdx = DISPLAY_START_INDEX + c;
        for (let r = 0; r < 24; r++) {
            if (tableData[r][arrIdx] && tableData[r][arrIdx].trim() !== '') {
                lastFilledCol = c;
                break;
            }
        }
        if (lastFilledCol >= 0) break;
    }
    
    if (lastFilledCol < 5) {
        document.getElementById('noteSection').innerHTML = '<div class="note-item">Compare လုပ်ရန် column 6 ခုအနည်းဆုံး လိုအပ်ပါသည်။</div>';
        return;
    }
    
    // Find the last filled row in lastFilledCol
    const lastColArrIdx = DISPLAY_START_INDEX + lastFilledCol;
    let lastFilledRow = -1;
    for (let r = 0; r < 24; r++) {
        if (tableData[r][lastColArrIdx] && tableData[r][lastColArrIdx].trim() !== '') {
            lastFilledRow = r;
        }
    }
    
    // Blank rows = rows after lastFilledRow
    const blankRows = [];
    for (let r = lastFilledRow + 1; r < 24; r++) {
        blankRows.push(r);
    }
    
    if (blankRows.length === 0) {
        document.getElementById('noteSection').innerHTML = '<div class="note-item">နောက်ဆုံး column တွင် blank row မရှိပါ။ အားလုံးဖြည့်ပြီးပါပြီ။</div>';
        return;
    }
    
    // Compare source = 5 columns back from lastFilledCol, same row as blank
    const COL_GAP = 5;
    const sourceCol = lastFilledCol - COL_GAP;
    if (sourceCol < 0) {
        document.getElementById('noteSection').innerHTML = '<div class="note-item">Compare source column မရှိပါ။ Column ပိုလိုအပ်ပါသည်။</div>';
        return;
    }
    
    const notes = [];
    const arrowPairs = [];
    
    for (const blankRow of blankRows) {
        const sourceArrIdx = DISPLAY_START_INDEX + sourceCol;
        const sourceVal = tableData[blankRow][sourceArrIdx] || '';
        
        if (!sourceVal || sourceVal.trim() === '') continue;
        
        // Generate permutations
        const perms = getPermutations(sourceVal);
        
        // Highlight compare source in green table
        const greenSrcCell = document.getElementById('green-r' + blankRow + '-c' + sourceCol);
        if (greenSrcCell) greenSrcCell.classList.add('compare-source');
        
        // Highlight in yellow table if visible
        if (sourceCol >= 5) {
            const yellowSrcCell = document.getElementById('yellow-r' + blankRow + '-c' + sourceCol);
            if (yellowSrcCell) yellowSrcCell.classList.add('compare-source');
        }
        
        // Search backward from sourceCol-1 toward column 00 for permutations in ALL rows
        const matches = [];
        for (let searchCol = sourceCol - 1; searchCol >= 0; searchCol--) {
            const searchArrIdx = DISPLAY_START_INDEX + searchCol;
            for (let searchRow = 0; searchRow < 24; searchRow++) {
                const cellVal = tableData[searchRow][searchArrIdx] || '';
                if (cellVal && perms.includes(cellVal)) {
                    matches.push({ row: searchRow, col: searchCol, val: cellVal });
                    
                    // Highlight in green table
                    const gCell = document.getElementById('green-r' + searchRow + '-c' + searchCol);
                    if (gCell) gCell.classList.add('match-found');
                    
                    // Highlight in yellow table
                    if (searchCol >= 5) {
                        const yCell = document.getElementById('yellow-r' + searchRow + '-c' + searchCol);
                        if (yCell) yCell.classList.add('match-found');
                    }
                    
                    arrowPairs.push({
                        fromRow: blankRow, fromCol: sourceCol,
                        toRow: searchRow, toCol: searchCol
                    });
                }
            }
        }
        
        // Add to notes - even 1 or 2 matches
        if (matches.length > 0) {
            const matchClass = matches.length >= 3 ? 'match-3plus' : '';
            const matchList = matches.map(m => m.val + '(R' + (m.row+1) + ',C' + getDisplayColName(m.col) + ')').join(', ');
            notes.push('<div class="note-item ' + matchClass + '">' +
                'Row ' + (blankRow+1) + ' | Source: Col ' + getDisplayColName(sourceCol) + ' = ' + sourceVal + ' | ' +
                'Perms: [' + perms.join(', ') + '] | ' +
                'Found ' + matches.length + ': ' + matchList + '</div>');
        }
    }
    
    // Render notes
    if (notes.length > 0) {
        document.getElementById('noteSection').innerHTML = notes.join('');
    } else {
        document.getElementById('noteSection').innerHTML = '<div class="note-item">Match မတွေ့ပါ။</div>';
    }
    
    // Draw curved arrows
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
        drawOneArrow('green', greenSvg, pair.fromRow, pair.fromCol, pair.toRow, pair.toCol);
    }
    
    for (const pair of pairs) {
        if (pair.fromCol >= 5 && pair.toCol >= 5) {
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
    
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;
    
    const curveOff = Math.min(dist * 0.25, 40);
    const nx = -dy / dist * curveOff;
    const ny = dx / dist * curveOff;
    const cx = midX + nx;
    const cy = midY + ny;
    
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
    const curW = parseFloat(svg.style.width) || 0;
    const curH = parseFloat(svg.style.height) || 0;
    if (maxW > curW) svg.style.width = maxW + 'px';
    if (maxH > curH) svg.style.height = maxH + 'px';
}

// ============ ZOOM ============
function setZoom(level) {
    zoomLevel = Math.max(0.4, Math.min(3, level));
    document.querySelectorAll('.table-inner-rel, #fixTable').forEach(el => {
        el.style.transform = 'scale(' + zoomLevel + ')';
        el.style.transformOrigin = 'top left';
    });
}
