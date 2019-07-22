### 表达式
可以将任何布局`layout`属性，绘图`paint`属性或过滤器`filter`的值指定为表达式
表达式表示为JSON数组。表达式数组的第一个元素是命名表达式运算符的字符串.后续元素（如果有）是表达式的参数。每个参数都是文字值（字符串，数字，布尔值或null）或其他表达式数组。
>
[expression_name, argument_0, argument_1, ...]

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

