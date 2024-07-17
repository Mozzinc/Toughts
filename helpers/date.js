function localeFunc (number, index) {
    return [
        ['Agora mesmo', 'Agora'],
        ['Há %s segundos', 'Em %s segundos'],
        ['Há um minuto', 'Em um minuto'],
        ['Há %s minutos', 'Em %s minutos'],
        ['Há uma hora', 'Em uma hora'],
        ['Há %s horas', 'Em %s horas'],
        ['Ontem', 'Amanhã'],
        ['Há %s dias', 'Em %s dias'],
        ['Há uma semana', 'Em uma semana'],
        ['Há %s semanas', 'Em %s semanas'],
        ['Há um mês', 'Em um mês'],
        ['Há %s meses', 'Em %s meses'],
        ['Há um ano', 'Em um ano'],
        ['Há %s anos', 'Em %s anos'],
    ][index];
}

function toDate(input) {
    if (input instanceof Date)
        return input;
    
    if (!isNaN(input) || /^\d+$/.test(input))
        return new Date(parseInt(input));
    input = (input || '')
        .trim()
        .replace(/\.\d+/, '')
        .replace(/-/, '/')
        .replace(/-/, '/')
        .replace(/(\d)T(\d)/, '$1 $2')
        .replace(/Z/, ' UTC')
        .replace(/([+-]\d\d):?(\d\d)/, ' $1$2');
    return new Date(input);
}

function formatDiff(diff) {    
    var agoIn = diff < 0 ? 1 : 0;
    
    diff = Math.abs(diff);
    
    var totalSec = diff;
    
    var SEC_ARRAY = [
        60,
        60,
        24,
        7,
        365 / 7 / 12,
        12,
    ];
    
    var idx = 0;
    for (; diff >= SEC_ARRAY[idx] && idx < SEC_ARRAY.length; idx++) {
        diff /= SEC_ARRAY[idx];
    }
    
    diff = Math.floor(diff);
    idx *= 2;
    if (diff > (idx === 0 ? 9 : 1))
        idx += 1;
    return localeFunc(diff, idx, totalSec)[agoIn].replace('%s', diff.toString());
}

function diffSec(date, relativeDate) {
    var relDate = relativeDate ? toDate(relativeDate) : new Date();
    return (+relDate - +toDate(date)) / 1000;
}

var formatHumanDate = function (date, relativeDate) {
    var sec = diffSec(date, relativeDate);
    return formatDiff(sec);
};

module.exports = {
    formatHumanDate,
  };
  