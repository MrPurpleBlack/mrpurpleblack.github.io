var flag_0;
var flag_1;
var out_br;

function calculate()
{
    var NumOfVars = document.DataInput.NumOfVars.value;//Количество переменных
    var ExpressionValue = document.DataInput.MM.value;//Значение мднф или мкнф
	var exp = document.DataInput.exp.value;//Выражение таблицы истинности
	
   
	
    var groups = new Array();
	//Флаги исключений
    flag_0 = true;
    flag_1 = true;
	
    for(var index = 0;index < Math.pow(2,NumOfVars); index++)//Составление списка ячеек
    {
		if(exp[index] == ExpressionValue)groups.push([index]);
		switch(exp[index])
		{
			case '0':
				flag_1 = false;
				continue;
			case '1':
				flag_0 = false;
				continue
			default:
				alert("Таблица истинности заполнена неверными значениями!");//Ошибка - недопустимое значение
				return '';
		}
    }
	//Вывод исключительных выражений
    if(flag_0) return /*'(X0 & \u0305X0)';*/[];
    //if(flag_1) return /*'(X0 V \u0305X0)';*/groups;
           
    for(var i = 1; i < Math.pow(2,NumOfVars); i <<= 1)//Объединение ячеек в группы
        groups = MakeGroups(groups,NumOfVars,i);
        
    groups = groups.sort(function(a,b){return b.length - a.length})
	
	//Исключение повторяющихся и ненужных групп
    for(var iter = 0; iter < NumOfVars; iter++)
    {
		groups = CheckGroups(groups);
        var buf = groups.shift();
        groups.push(buf);
    }
	return groups
}

function GenerateTruthTable(NumOfVars)
{
	var Vars='';
    var TT = new Array();
    for(var i=0;i<NumOfVars;i++)
	{
		TT[i]='0 ';
		Vars+='X<sub>'+i+'</sub>';
	}
	document.getElementById("Vars").innerHTML = Vars;
    var fin = TT.join('');
    for(var row=0; row<Math.pow(2,NumOfVars)-1;row++)
    {
        for(var col=NumOfVars-1;col>=0;col--)
        {
            while(TT[col] == '1 ')
                TT[col--] = '0 ';
            TT[col] = '1 ';
            break;
        }
        fin+=TT.join('');
    }
    return fin
}
    
function ValNumChange(NumOfVars)
{
    var BinPow = Math.pow(2,NumOfVars);
	var Data = document.DataInput;
	
    Data.exp.maxLength = BinPow;
    Data.exp.value = '';
    Data.TruthTable.style.width = 14*NumOfVars + 2 + 'px';
    Data.TruthTable.value = GenerateTruthTable(NumOfVars);
	
    var x= 15*BinPow + 5;
    Data.exp.style.height = x + 'px';
    Data.TruthTable.style.height = x + 'px';
	
    if(NumOfVars < 5) x=370;
	document.getElementById("input").style.height = x + 70 + 'px';
    document.getElementById("karnaugh").style.height = x + 70 + 'px';
}
        
Array.prototype.ArrayInArray = function(array)
{
    for(var i=0; i < this.length; i++)
    {
        var flag = true;
        if(this[i].length != array.length)
            continue;
        for(var j = 0;j < this[i].length;j++)
        {
            if(this[i][j] != array[j])
            {
                flag=false;
                break;
            }
        }
        if(flag) return true;
    }
    return false;
}
        
Array.prototype.ValueInArray = function(value)
{
for(var i = 0; i < this.length; i++)
    if(this[i] == value) return true;
return false;
}
        
function MakeGroups(groups,NumOfVars,leng)
{
    var NewGroups = new Array();
    for(var group=0;group<groups.length;group++)
    {
        var PotentialGroups = new Array();
        if(groups[group].length==leng)
        {
            for(var BinPow = Math.pow(2,NumOfVars-1); BinPow>=1; BinPow/=2)
            {   
                var PotNeibGroup = groups[group].slice(0);//Создание потенциальной соседней группы
                for(var i=0;i<PotNeibGroup.length;i++)
                {
                    PotNeibGroup[i] -= 0;
                    PotNeibGroup[i] += BinPow;
                    if(PotNeibGroup[i]%(BinPow<<1)<BinPow)
                    {
                        PotNeibGroup = [];
                        break;
                    }
                }
                if(PotNeibGroup && groups.ArrayInArray(PotNeibGroup))
                    PotentialGroups.push(PotNeibGroup.concat(groups[group]));
            }
        }
		
		if(PotentialGroups.length)
			NewGroups = NewGroups.concat(PotentialGroups).sort(function(a,b){return a[0]&2});//Почему-то работает
		else NewGroups.push(groups[group]);
    }
    return NewGroups;
} 
        
function CheckGroups(groups)
{
    var DescCells = new Array();
    var NewGroups = new Array();
    for(var group=0;group<groups.length;group++)
    {
        for(var cell=0;cell<groups[group].length;cell++)
        {
            if(!DescCells.ValueInArray(groups[group][cell]))
            {
                DescCells = DescCells.concat(groups[group])
                NewGroups.push(groups[group])
                break;
            }
        }
    }
    return NewGroups.sort(function(a,b){return b.length - a.length})
}
        
function MakeLogExpression(groups)
{
	if(flag_0) return 'X\u2080 V \u0305X\u2080';
	if(flag_1) return 'X\u2080 & \u0305X\u2080';
	var NumOfVars = document.DataInput.NumOfVars.value;
	var InvSigns = ['','\u0305'];//Функции не
    var BracketOps = [' & ',' V '];//Функции И, ИЛИ
    var ExpressionValue = document.DataInput.MM.value;//Значение мднф или мкнф
	
    if(ExpressionValue == '0')//Проверка на мкнф
    {
        InvSigns.reverse();
        BracketOps.reverse();
    }
	
	out_br = BracketOps[1];
	
    var expression = [];
    var UnicodeIndex = ['\u2080','\u2081','\u2082','\u2083','\u2084','\u2085'];
    for(var gr = 0; gr < groups.length; gr++)
    {
        var group = [];
        for(var cell = 0; cell < groups[gr].length; cell++)
        {
            var GroupCell = [];
            for(var BinPow = NumOfVars; BinPow; BinPow--)
            {
                var sign = 0;
                var bin = Math.pow(2,BinPow);
                if(groups[gr][cell]%bin < (bin>>1)) sign++;
                GroupCell.push(InvSigns[sign] + 'X' + UnicodeIndex[NumOfVars-BinPow]);
            }
            group.push(GroupCell);
        }
        for(var cell = 1; cell < group.length; cell++)
            for(var val = 0; val < group[cell].length; val++)
                if(group[0][val] != group[cell][val])
                    group[0][val] = '';
                            
        group = group[0].filter(function(item){return item;});        
        group = '('+group.join(BracketOps[0])+')';
		
        expression.push(group);
        }
	return expression.sort()
    //return expression.join(BracketOps[1]);
}

        /*  
		Старый алгоритм!!!
		
        1. Перебираются все группы в списке групп
        2. Для группы создается ее копия (потенциальная соседняя группа)
        3. Затем каждому элементу в группе прибавляется степень двойки от 32 до 1 (в цикле)
        4. Если такая группа есть в списке групп, то она добавляется в список потенциальных групп
        5. С каждой потенциальной группой создаем новую группу, путем совмещения с группой из списка групп
        7. Проверяем элементы этой группы на наличие в массиве использованных ячеек
        8. Если среди элементов новой группы находится, хоть одна ячейка, которой нет в списке использованных групп, 
        то новая группа, добавляется в список новых групп, а список использованных ячеек расширяется с новой группой
        9. Возвращается список новых групп
        
              ____ ___X4__ _______ ___X4__ ____
              _______X0_______ ______nX0_______
               ___ ___ ___ ___ ___ ___ ___ ___
            | | 48| 50| 58| 56| 24| 26| 18| 16| |   |
         nX3| |___|___|___|___|___|___|___|___| |   |nX5
            | | 49| 51| 59| 57| 25| 27| 19| 17| |   |
            | |___|___|___|___|___|___|___|___| |X1 |
            | | 53| 55| 63| 61| 29| 31| 23| 21| |   |
            | |___|___|___|___|___|___|___|___| |   |
            | | 52| 54| 62| 60| 28| 30| 22| 20| |   |
            | |___|___|___|___|___|___|___|___| |   |nX5
          X3| | 36| 38| 46| 44| 12| 14| 6 | 4 | |   |
            | |___|___|___|___|___|___|___|___| |   |
            | | 37| 39| 47| 45| 13| 15| 7 | 5 | |   |
            | |___|___|___|___|___|___|___|___| |nX1|
            | | 33| 35| 43| 41| 9 | 11| 3 | 1 | |   |
         nX3| |___|___|___|___|___|___|___|___| |   |
            | | 32| 34| 42| 40| 8 | 10| 2 | 0 | |   |nX5
            | |___|___|___|___|___|___|___|___| |   |
               ___nX2__ ______X2_______ __nX2___
        
        nX0 : x%64 < 32 
        nX1 : x%32 < 16 
        nX2 : x%16 < 8
        nX3 : x%8 < 4
        nX4 : x%4 < 2
        nX5 : x%2 < 1
        
        1101 = 13
        
        13%16 = 13 : 13 > 8 true
        13%8 = 5 : 5 > 4 true
        13%4 = 1 : 1 > 2 false
        13%2 = 1 : 1 > 1 true
        
        0111 = 7
        
        7%16 = 7 : 7 > 8 false
        7%8 = 7 : 7 > 4 true
        7%4 = 3 : 3 > 2 true
        
        
        */