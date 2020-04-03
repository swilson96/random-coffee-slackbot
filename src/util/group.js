// https://stackoverflow.com/questions/31352141/how-do-you-split-an-array-into-array-pairs-in-javascript
const reducer = (acc, _, index, original) => {
    if (index % 2 === 0) {
        acc.push(original.slice(index, index + 2));
    }
    return acc;
}

module.exports = (array) => {    
    const groups = array.reduce(reducer, []);
    
    const numGroups = groups.length;
    const lastGroup = groups[numGroups - 1];
    
    if (numGroups > 1 && lastGroup.length === 1) {
        groups.pop();
        groups[numGroups - 2].push(lastGroup[0]);
    }

    return groups;
}
