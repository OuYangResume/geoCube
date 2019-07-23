### 表达式
可以将任何布局`layout`属性，绘图`paint`属性或过滤器`filter`的值指定为表达式
表达式表示为JSON数组。表达式数组的第一个元素是命名表达式运算符的字符串.后续元素（如果有）是表达式的参数。每个参数都是文字值（字符串，数字，布尔值或null）或其他表达式数组。
>
[expression_name, argument_0, argument_1, ...]

#### 类型断言表达式
> array 断言输入是一个数组（可选择具有特定的项类型和长度）。如果在计算输入表达式时，它不是断言类型，则此断言将导致整个表达式中止。
> ["array", type: "string" | "number" | "boolean", value]: array<type>
> 
> boolean 如果提供了多个值，则按顺序计算每个值，直到获得布尔值。如果没有输入是布尔值，则表达式是错误的。
> ["boolean", value, fallback: value, fallback: value, ...]: boolean
> 
> number 如果提供多个​​值，则按顺序评估每个值，直到获得数字。如果没有输入是数字，则表达式是错误的。["number", value, fallback: value, fallback: value, ...]: number
> 
> string 如果提供了多个值，则按顺序评估每个值，直到获得字符串。如果没有输入是字符串，则表达式是错误的。["string", value, fallback: value, fallback: value, ...]: string

#### 类型转换表达式	
>to-boolean 当接着输入是空字符串，0， ，false，null或NaN 就为flase; 否则就是true。
>["to-boolean", value]: boolean
>
>to-color 如果提供了多个值，则按顺序评估每个值，直到获得第一次成功转换。如果没有任何输入可以转换，则表达式是错误的。
>["to-color", value, fallback: value, fallback: value, ...]: color
>
>to-number 	如果提供了多个值，则按顺序评估每个值，直到获得第一次成功转换。如果没有任何输入可以转换，则表达式是错误的。
>["to-number", value, fallback: value, fallback: value, ...]: number
>
>to-string 如果输入是null，结果是""。如果输入是布尔值，则结果为"true"或"false"。如果输入是数字，则将其转换为ECMAScript语言规范的“NumberToString”算法所指定的字符串。如果输入是一种颜色，则将其转换为形式的字符串"rgba(r,g,b,a)"，其中r,, g和b为0到255之间的数字，a范围从0到1.否则，输入将转换为指定格式的字符串。JSON.stringifyECMAScript语言规范的功能。
>["to-string", value]: string

####  Lookup 查找
> ["at", number, array]: ItemType
> 
> get 从当前要素的属性中检索属性值，如果提供了第二个参数，则从另一个对象中检索属性值。如果缺少请求的属性，则返回null。
> ["get", string, object]: value
> 
> has 测试当前要素属性中是否存在属性值，如果提供了第二个参数，则测试另一个对象.
> ["has", string, object]: boolean
> 
> length 获取数组或字符串的长度。
> ["length", string | array | value]: number

#### Decision 样式添加条件逻辑

> ！逻辑否定。
> ["!", boolean]: boolean

> ！= 比较是严格类型的：不同运行时类型的值始终被视为不相等。已知在解析时类型不同的情况被视为无效并将产生解析错误。接受可选collator参数以控制依赖于区域设置的字符串比较。
> ["!=", value, value, collator]: boolean
> 
> < 如果第一个输入严格小于第二个输入返回true，接受可选collator参数以控制依赖于区域设置的字符串比较。
> ["<", value, value, collator]: boolean
> `>`,`>=`,`==`,`<`,`<=`都与上面类似。
> 
> all 如果所有输入都为真，则返回真；否则返回假.
> ["all", boolean, boolean, ...]: boolean
> 
> any 如果任何输入有一个为真，则返回真；否则返回假。
> ["any", boolean, boolean, ...]: boolean
> 
> case 选择相应测试条件评估为true的第一个输出，否则选择回退值
> ["case",
    condition: boolean, output: OutputType,
    condition: boolean, output: OutputType,
    ...,
    fallback: OutputType
]: OutputType
> eg: 
> ["case",
["boolean", ["feature-state", "hover"], false],
1,
0.5
]

>coalesce 依次计算每个表达式，直到获得第一个非空值，并返回该值。
>["coalesce", OutputType, OutputType, ...]: OutputType

> match 选择标签值与输入值匹配的输出，如果未找到匹配则选择回退值。输入可以是任何表达式（例如["get", "building_type"]）
> ["match",
    input: InputType (number or string),
    label: InputType | [InputType, InputType, ...], output: OutputType,
    label: InputType | [InputType, InputType, ...], output: OutputType,
    ...,
    fallback: OutputType
]: OutputType


#### 	插值

> interpolate  通过在输入和输出值对之间进行插值（“停止”），产生连续，平滑的结果。input可以是任何数值表达式（例如，["get", "population"]）。停止输入必须是严格按升序排列的数字文字。输出类型必须是number，array<number>，或color.
> 插值类型：

>["linear"]：在一对停止之间线性插值，小于和略大于输入。
["exponential", base]：在停靠点之间以指数方式插值，小于和大于输入。base控制输出增加的速率：较高的值使输出增加到更高的范围。当值接近1时，输出线性增加。
["cubic-bezier", x1, y1, x2, y2]：使用给定控制点定义的三次贝塞尔曲线进行插值。
>["interpolate",
    interpolation: ["linear"] | ["exponential", base] | ["cubic-bezier", x1, y1, x2, y2 ],
    input: number,
    stop_input_1: number, stop_output_1: OutputType,
    stop_input_n: number, stop_output_n: OutputType, ...
]: OutputType (number, array<number>, or Color)

> eg :
> [
     "interpolate",["linear"], ["zoom"],
       16,
       0,
       16.05,
      	["get", "height"]
 ],
 
> step 	通过评估由输入和输出值对（“停止”）定义的分段常数函数，生成离散的结果。input可以是任何数值表达式（例如，["get", "population"]）。输入必须是严格按升序排列的数字文字。返回小于输入的停止输出值，如果输入小于第一个停止，则返回第一个输入。
> ["step",
    input: number,
    stop_output_0: OutputType,
    stop_input_1: number, stop_output_1: OutputType,
    stop_input_n: number, stop_output_n: OutputType, ...
]: OutputType





















