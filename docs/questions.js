(function (globalScope) {
  function q(id, difficulty, highFrequency, question, keywords, answerPoints, details) {
    return {
      id: id,
      difficulty: difficulty,
      highFrequency: highFrequency,
      question: question,
      keywords: keywords,
      answerPoints: answerPoints,
      ...(details || {})
    };
  }

  const questionGroups = {
    "C++ 基础": [
      q("cpp-pointer-reference", "basic", true, "指针和引用的区别是什么？", ["指针", "引用", "pointer", "reference"], [
        "一句话抓住本质：指针本身是一个变量，里面存的是地址；引用不是变量，它只是给一个已经存在的对象起的另一个名字。",
        "打个比方：指针像一张写着门牌号的便利贴，可以擦掉改写成别家，也可以什么都不写（nullptr）；引用像给住在那儿的人起了个外号，一旦叫定就永远是他，而且不存在“空外号”。",
        "由这个本质能直接推出三条硬性区别：引用必须在定义时初始化；绑定之后不能改绑到别的对象；没有“空引用”这回事。",
        "用法上也不同：指针要显式解引用（*p、p->），引用在表达式里写起来就跟普通变量一样。",
        "接口设计时的选择标准很清晰：参数必须是一个有效对象、不允许为空，就用引用；可能没有、需要表达“可选”，就用指针或 std::optional。",
        "最后补一句所有权：引用和裸指针都不表达所有权。一旦涉及 new/delete，就该换成智能指针，而不是让裸指针在模块之间传来传去。"
      ], {
        diagramSteps: [
          "内存里有一个 int x = 10，它待在某个地址上，比如 0x1000。",
          "写 int* p = &x：会额外开一块内存来存“0x1000”这个数字，所以 p 自己也有地址。",
          "写 int& r = x：不会额外开一块内存存地址，r 从此就是 x 的另一个名字。",
          "执行 *p = 20 和 r = 20，效果完全一样，都是把 0x1000 那一格改成 20。",
          "但 p = &y 是把便利贴改写成别家的门牌号；而 r = y 不是改绑，是把 y 的值赋给 r 绑定的那个对象（也就是 x）。",
          "所以判断一个写法“改的是指向还是改的是值”，看的是类型，不是长相。"
        ],
        pitfalls: [
          "以为 r = y 是让引用改指向 y，实际上是把 y 的值赋给了 r 绑定的对象，这是初学最常见的误解。",
          "返回局部变量的引用或指针，函数一返回那块栈内存就失效了，拿到的是悬垂引用。",
          "以为引用一定不占内存 —— 标准只规定语义，编译器实现上很多时候仍然用指针实现，只是你看不见。",
          "把引用当成“保证非空”的护身符：写 int& r = *p; 时如果 p 是空指针，一样是未定义行为。"
        ],
        cppCode: "int x = 10, y = 99;\n\nint* p = &x;    // p 是变量，里面存的是 x 的地址\nint& r = x;     // r 不是变量，它就是 x 的另一个名字\n\n*p = 20;        // x 变成 20\nr  = 30;        // x 变成 30\n\np = &y;         // 便利贴改写：p 现在指向 y\nr = y;          // 注意！不是改绑，是把 y 的值赋给 x\n\nint* q = nullptr;   // 合法：空指针\n// int& s;          // 非法：引用必须初始化，也没有空引用\n\n// 接口里怎么选\nvoid mustHave(const Config& cfg);   // 必须给我一个有效对象\nvoid maybeHave(const Config* cfg);  // 可以传 nullptr 表示“没有”\n",
        complexity: [
          "这是最常见的开场题，考的不是背区别，而是能不能一句话点破“指针是变量、引用是别名”。",
          "答完区别主动补一句接口设计的选择标准，比单纯罗列语法差异更像有工程经验的人。"
        ]
      }),
      q("cpp-const-forms", "basic", true, "const int*、int* const、const int* const 分别是什么意思？", ["const", "pointer"], [
        "记忆方法只有一条，记住它就不会混：从右往左读，const 修饰它左边最近的那个东西；如果左边什么都没有，就修饰右边。",
        "`const int* p` 读作“p 是一个指针，指向常量 int”：不能通过 p 改值，但 p 自己可以改指别处。",
        "`int* const p` 读作“p 是一个常量指针，指向 int”：p 自己不能改指向，但可以通过它改值。",
        "`const int* const p` 两边都锁死，既不能改指向也不能改值。",
        "可以用遥控器和电视来记：第一种是遥控器能换指别的电视、但不能用它调这台；第二种是遥控器焊死在这台电视上、但能调；第三种是又焊死又不能调。",
        "还要知道 `const int*` 和 `int const*` 完全等价，只是写法不同 —— 后者其实更贴合“从右往左读”的规则。"
      ], {
        diagramSteps: [
          "拿到声明先从右往左念一遍：遇到 * 就念“指针”，遇到 const 就念“常量”。",
          "const int* p → 从 p 开始念：p 是一个指针，指向常量 int。",
          "int* const p → p 是一个常量指针，指向 int。",
          "判断“能不能改”时拆成两问：能不能改 p 本身（改指向）？能不能改 *p（改值）？",
          "位置决定答案：const 在 * 左边锁的是值，在 * 右边锁的是指针本身。",
          "两个 const 分别站在 * 两边，那就是两样都锁。"
        ],
        pitfalls: [
          "把 const int* 当成“指针不能改”，实际上不能改的是它指向的值。",
          "以为 const 对象在内存里就一定是只读的 —— const 主要是编译期约束，用 const_cast 绕过去再修改是未定义行为。",
          "给传值参数写 const（比如 void f(const int n)）意义不大，因为本来就是副本；真正有用的是 const 引用和 const 指针。",
          "成员函数末尾的 const（int get() const）修饰的是 this，和这里的指针 const 完全是两回事，很容易混。"
        ],
        cppCode: "int a = 1, b = 2;\n\nconst int* p1 = &a;   // 指向常量的指针：值锁死，指向可变\n// *p1 = 10;          // 错：不能通过 p1 改值\np1 = &b;              // 对：可以改指向\n\nint* const p2 = &a;   // 常量指针：指向锁死，值可变\n*p2 = 10;             // 对\n// p2 = &b;           // 错\n\nconst int* const p3 = &a;   // 两样都锁\n// *p3 = 10;   错\n// p3  = &b;   错\n\nint const* p4 = &a;   // 和 p1 完全等价，只是写法不同\n\n// 最常用的场合：只读参数，既不拷贝也保证不改\nvoid print(const std::string& s);\n",
        complexity: [
          "记住“从右往左读”这一条就够了，比死记三种组合可靠得多。",
          "面试官有时会写更长的声明（比如 const char* const* p）看你会不会拆，规则完全一样。"
        ]
      }),
      q("cpp-static-usage", "basic", true, "static 在局部变量、全局变量和类成员里分别有什么作用？", ["static", "生命周期"], [
        "static 是 C++ 里最“一词多义”的关键字，三个位置三个完全不同的意思，答题时一定要分开讲，别笼统说“静态的”。",
        "放在局部变量前：改变生命周期，但不改变作用域。它只在第一次执行到时初始化一次，函数返回后依然活着，下次进来还是上次那个值 —— 像函数里的私人保险柜，人走了柜子还在。",
        "放在全局变量或函数前：改变的是链接属性，把符号限制在当前源文件里，别的文件链接不到 —— 像一张内部通行证，出不了这栋楼。现代 C++ 更推荐用匿名命名空间达到同样效果。",
        "放在类成员前：这个成员属于类本身而不是每个对象，所有对象共享同一份 —— 像“班级人数”是挂在班级上的，不是每个学生兜里揣一份。",
        "静态成员函数没有 this，所以它只能访问静态成员，也正因为如此，它能当普通函数指针用，常拿来做回调入口。",
        "补一条 C++11 之后的重要保证：函数内静态变量的初始化是线程安全的，这正是 Meyers 单例能成立的基础。"
      ], {
        diagramSteps: [
          "局部 static：第一次调用函数时执行初始化，之后每次进来都跳过初始化，直接用上次留下的值。",
          "它存放的位置不是栈而是全局数据区，所以函数返回时不会被回收。",
          "文件级 static：编译出的目标文件里这个符号被标记成“内部链接”，链接器在别的文件里根本看不到它。",
          "类静态成员：不放在对象内存里，所以 sizeof(对象) 不包含它，它单独待在全局数据区。",
          "类静态成员要在类内声明、类外定义；C++17 起可以写 inline static 直接在类内定义并初始化。",
          "静态成员函数没有 this，因此签名和普通函数一致，可以直接赋给函数指针。"
        ],
        pitfalls: [
          "以为局部 static 把作用域也扩大了 —— 它只延长寿命，函数外面依然看不见这个名字。",
          "在多线程里依赖局部 static 的“只初始化一次”，却忘了这是 C++11 才开始保证的，老编译器上可能有竞态。",
          "类静态成员忘了在类外定义，链接时报 undefined reference，这是 C++17 之前的经典坑。",
          "跨源文件依赖全局对象的初始化顺序 —— 标准不保证不同编译单元之间的顺序，这就是静态初始化顺序问题。"
        ],
        cppCode: "// ① 局部 static：生命周期变长，作用域不变\nint counter() {\n    static int n = 0;   // 只在第一次调用时初始化\n    return ++n;         // 依次返回 1, 2, 3, ...\n}\n\n// ② 文件级 static：只在本文件可见\nstatic int g_secret = 42;   // 别的 .cpp 链接不到\nstatic void helper() {}     // 现代写法更推荐用匿名 namespace\n\n// ③ 类静态成员：所有对象共享一份\nstruct Account {\n    static int total;        // 声明\n    int id = 0;\n    static int getTotal() {  // 静态成员函数：没有 this\n        return total;\n    }\n};\n// 类外定义；C++17 起可写 inline static int total = 0;\nint Account::total = 0;\n\n// C++11 起保证线程安全的初始化 —— Meyers 单例\nLogger& instance() {\n    static Logger obj;\n    return obj;\n}\n",
        complexity: [
          "按“局部变量 / 文件级 / 类成员”三段来答，比笼统说“static 是静态的”清楚得多。",
          "主动提到 C++11 的线程安全初始化保证和 Meyers 单例，是明显的加分点。"
        ]
      }),
      q("cpp-define-vs-const", "basic", true, "define、const、constexpr 的区别是什么？", ["define", "constexpr"], [
        "最清楚的讲法是按“它们各自工作在哪个阶段”来分：define 在预处理阶段，const 在编译阶段（生成一个只读对象），constexpr 要求在编译期就能把值算出来。",
        "define 是纯文本替换，预处理器根本不认识 C++ 语法：没有类型、没有作用域、不进符号表。编译器看到的已经是替换后的样子，所以报错信息指着一坨你没写过的表达式，调试器里也找不到这个名字。",
        "最经典的坑是 #define SQUARE(x) x * x，遇到 SQUARE(1 + 2) 会展开成 1 + 2 * 1 + 2 = 5，而不是 9。加括号能救优先级，但类型检查这一条永远补不回来。",
        "const 定义的是一个真正的对象：有类型、有作用域、调试器里看得见，只是不允许修改。",
        "constexpr 更进一步，要求编译期就能求值，所以它的结果可以用在数组长度、模板参数、case 标签这些必须是编译期常量的位置。",
        "现代 C++ 的选择顺序很明确：能用 constexpr 就用 constexpr，其次 const，宏只留给真正需要文本替换的场合，比如条件编译和标识符拼接。"
      ], {
        diagramSteps: [
          "源码先经过预处理器：所有 #define 在这一步被无脑替换成文本，编译器之后看到的已经是替换结果。",
          "接着进入编译器：这时才有类型检查，const 对象在这一步被登记进符号表。",
          "constexpr 变量还要多满足一个条件：初始化表达式必须能在编译期求出结果。",
          "所以 constexpr 的值可以直接拿去当数组长度，而一个由函数返回值初始化的 const 变量就不行。",
          "调试时差别最直观：const 和 constexpr 的名字在调试器里看得到，宏的名字早在预处理阶段就不存在了。",
          "报错信息也一样：宏出错时编译器指着展开后的表达式，你得自己倒推回原始写法。"
        ],
        pitfalls: [
          "宏没有作用域，很容易和别处的名字撞车，Windows 头文件里的 min/max 是最著名的例子。",
          "带参数的宏不加括号会因为运算符优先级出错；参数带副作用时还会被求值多次，比如 SQUARE(i++) 会让 i 自增两次。",
          "以为 const 就等于编译期常量 —— const int n = f(); 里的 n 是运行时才确定的。",
          "以为 constexpr 函数一定在编译期执行，实际上参数不是常量时它照样退化成普通的运行时调用。"
        ],
        cppCode: "// 宏：预处理阶段的文本替换，没有类型也没有作用域\n#define SQUARE(x) x * x\nint bad = SQUARE(1 + 2);         // 展开成 1 + 2 * 1 + 2 = 5，不是 9\n\n#define SQUARE2(x) ((x) * (x))   // 加括号能救优先级\nint worse = SQUARE2(i++);        // 但救不了副作用：i 被自增了两次\n\n// const：真正的只读对象，有类型有作用域\nconst int kMax = 100;\nconst int runtime = getValue();  // 合法：值到运行时才确定\n\n// constexpr：要求编译期就能算出来\nconstexpr int kSize = 10 * 2;\nint arr[kSize];                  // 可以当数组长度\n\nconstexpr int square(int x) { return x * x; }\nconstexpr int a = square(5);     // 编译期就算好了\nint n = readInput();\nint b = square(n);               // 参数不是常量，退化成运行时调用\n",
        complexity: [
          "按“预处理 / 编译 / 编译期求值”三个阶段来讲，逻辑链最清楚。",
          "SQUARE(1 + 2) 这个例子几乎是必备的，一句话就能说明宏为什么危险。"
        ]
      }),
      q("cpp-struct-vs-class", "basic", true, "struct 和 class 的区别是什么？", ["struct", "class"], [
        "语言层面只有两个区别，而且都只是“默认值”不同：成员的默认访问权限（struct 是 public，class 是 private），以及默认继承方式（struct 默认 public 继承，class 默认 private 继承）。",
        "除此之外两者完全一样：struct 照样可以有构造函数、成员函数、虚函数、继承和模板。这一点和 C 里的 struct 完全不是一回事。",
        "所以真正的差别在于约定俗成的用法：struct 表示“就是一堆数据放在一起”，没有需要维护的不变量；class 表示“有封装、有不变量要保护”的对象。",
        "判断标准可以这么说：如果这个类型的成员随便怎么改都不会破坏它的正确性，那就用 struct；只要有一个成员被改坏就会让对象进入非法状态，就该用 class 并把它藏起来。",
        "顺带一提，模板参数写 typename 还是 class 也是历史遗留，两者完全等价。"
      ], {
        diagramSteps: [
          "先写 struct Point { int x; int y; };，这里的 x、y 默认是 public，外面能直接访问。",
          "把 struct 换成 class，一个字都不改，x、y 就变成 private 了，外面访问不到。",
          "再看继承：struct D : Base {} 等价于 struct D : public Base {}。",
          "而 class D : Base {} 等价于 class D : private Base {} —— 这个默认值最容易被忘掉。",
          "忘掉的后果是：派生类在外部无法当作基类使用，因为继承关系是私有的。",
          "语言只管到这里为止，剩下的都是团队约定，而约定的分界线就是“有没有需要保护的不变量”。"
        ],
        pitfalls: [
          "忘了 class 的默认继承是 private，写完 class D : Base 之后发现 D 不能当 Base 用。",
          "以为 struct 是“C 风格的、只能放数据的结构体”，其实它有完整的面向对象能力。",
          "风格混用：一个类型一半 public 一半靠注释约束，等于失去了封装的意义。",
          "拿 struct 承载有不变量的类型，别人绕过构造函数直接改成员，把对象改成非法状态。"
        ],
        cppCode: "// 语言层面的差别只有默认权限\nstruct S { int a; };   // a 是 public\nclass  C { int a; };   // a 是 private\n\n// 继承的默认值也不同\nstruct D1 : Base {};   // 等价于 : public Base\nclass  D2 : Base {};   // 等价于 : private Base —— 容易忘\n\n// 约定用法：纯数据聚合用 struct\nstruct Quote {\n    double bid = 0;\n    double ask = 0;\n};\n\n// 有不变量要保护就用 class\nclass Account {\npublic:\n    void withdraw(double amt);   // 内部保证余额不会变成负数\nprivate:\n    double balance_ = 0;         // 不允许外面随便改\n};\n",
        complexity: [
          "这题看着简单，实际考的是你有没有“封装是为了保护不变量”这个意识。",
          "答完两个默认值的差别一定要补上工程上的选择标准，否则显得只背了语法。"
        ]
      }),
      q("cpp-inline", "intermediate", true, "inline 关键字到底是干什么的？加了它编译器就一定会内联吗？", ["inline", "内联优化", "链接", "ODR"], [
        "回答这题的第一步，是把两个撞了名字的东西拆开：一个是「内联优化」，那是编译器的行为；另一个是「inline 关键字」，它今天管的其实是链接。混着说就一定讲不清。",
        "先说内联优化。它指的是编译器把函数调用直接替换成函数体，省掉传参、跳转、返回这一整套开销。就像查字典时不再翻到某一页去看解释，而是把解释直接抄进句子里。要不要这么做，完全由编译器根据函数大小、调用次数、优化级别自己决定。",
        "再说 inline 关键字。它真正的含义是告诉链接器：“这个函数允许在多个目标文件里各出现一份定义，你挑一份用就行，别报重复定义。”这就是为什么在头文件里写函数定义必须加 inline —— 它豁免的是单一定义原则（ODR）。",
        "把两件事拆开之后，就能明白为什么两个方向都不成立：写了 inline，编译器完全可能因为函数太大而拒绝内联；没写 inline，编译器照样可能把它内联掉（同一个编译单元里非常常见，开了 LTO 之后跨文件也能内联）。",
        "有几种情况本来就是隐式 inline 的，不用自己写：类内部直接定义的成员函数、constexpr 函数、以及模板。",
        "内联也不是越多越好：函数体被复制到每一个调用点，代码体积变大，指令缓存命中率下降，反而可能更慢。只有热路径上的小函数才真正值得内联。",
        "补充一个 C++17 的新用法：inline 还能修饰变量，让你直接在头文件里定义全局变量或类的静态成员，不用再在某个 .cpp 里补一句定义。"
      ], {
        diagramSteps: [
          "先看内联优化在做什么：调用 add(a, b) 的正常流程是准备参数、跳转到 add、执行、再跳回来。",
          "内联之后，编译器把 a + b 这段代码直接抄到调用点，跳转和返回都省掉了。",
          "对一个只有一行的函数，调用开销可能比函数本身还大，所以收益明显；对几百行的函数，收益几乎为零，代码却膨胀好几倍。",
          "再看关键字在做什么：一个头文件被三个 .cpp 包含，如果里面有函数定义，就会编出三份同名符号，链接器报 multiple definition。",
          "加上 inline 之后，链接器知道这些是同一个函数的多份副本，保留一份即可，不再报错。",
          "这两件事唯一的联系是历史原因：当年这个关键字确实带着“建议编译器内联”的意思，但现代编译器早就按自己的成本模型决定，把它当建议看都很勉强。"
        ],
        pitfalls: [
          "以为写了 inline 就一定会被内联 —— 它现在连“建议”都算不上，编译器基本按自己的成本模型决定。",
          "想强制内联却用错工具：标准里没有这个能力，真要强制得用编译器扩展，GCC/Clang 是 __attribute__((always_inline))，MSVC 是 __forceinline。",
          "在头文件里写了非模板函数的定义却忘了加 inline，链接时报 multiple definition。",
          "为了“性能”给大函数加 inline，结果代码膨胀、指令缓存命中率下降，反而更慢。",
          "把函数定义放在 .cpp 里却期待它被跨文件内联 —— 除非开了 LTO（-flto），否则编译器根本看不到函数体，没法内联。"
        ],
        cppCode: "// ① 关键字的真正作用：豁免 ODR，允许多份定义\n// util.h —— 会被多个 .cpp 包含\ninline int add(int a, int b) { return a + b; }\n// 不加 inline 的话，链接时报 multiple definition of `add'\n\n// ② 这些情况隐式就是 inline，不用自己写\nstruct Box {\n    int size() const { return n; }   // 类内定义，隐式 inline\n    int n = 0;\n};\nconstexpr int twice(int x) { return 2 * x; }   // constexpr 隐式 inline\ntemplate <class T> T max2(T a, T b);           // 模板同样不受限制\n\n// ③ 内联优化和关键字无关：下面这个没写 inline，\n//    但在同一个 .cpp 里被调用时，编译器照样可能内联掉\nstatic int helper(int x) { return x * 2; }\n\n// ④ 真要强制内联只能用编译器扩展（非标准，慎用）\n// GCC/Clang 的写法：\n__attribute__((always_inline)) inline int hot(int x) { return x + 1; }\n\n// ⑤ C++17 的 inline 变量：头文件里直接定义，不用再去 .cpp 补一句\ninline int g_version = 3;\nstruct Cfg { inline static int count = 0; };\n",
        complexity: [
          "这题的正确开场是“先分清关键字和优化是两件事”，能这么开头基本就答对一半了。",
          "常见追问有两个：“那怎么让它一定内联”答编译器扩展；“内联有什么坏处”答代码膨胀和指令缓存命中率下降。"
        ]
      }),
      q("cpp-sizeof-vs-strlen", "basic", true, "sizeof 和 strlen 的区别是什么？", ["sizeof", "strlen", "数组退化"], [
        "一句话区分：sizeof 是量盒子有多大，strlen 是数盒子里装了几个字符。",
        "sizeof 在编译期就能确定，它看的是类型，结果包含数组的全部字节；对字符串字面量来说，这里面还包含结尾那个 '\\0'。它不产生任何运行时代码。",
        "strlen 是运行时的库函数，从头开始一个字节一个字节地数，遇到 '\\0' 才停，结果不含这个结束符，复杂度是 O(n)。",
        "最经典的例子：char s[] = \"abc\"，sizeof(s) 是 4（三个字符加一个结束符），strlen(s) 是 3。",
        "最大的坑是数组作为函数参数会退化成指针：函数里对参数用 sizeof 得到的是指针大小（64 位上是 8），原来的数组长度已经丢了。所以传数组必须额外把长度也传进去。",
        "还有一个安全隐患：strlen 完全依赖 '\\0' 的存在。如果缓冲区里没有结束符，它会一直往后读，读出越界甚至直接崩溃。"
      ], {
        diagramSteps: [
          "写 char s[] = \"abc\"，内存里实际躺着四个字节：'a' 'b' 'c' '\\0'。",
          "sizeof(s)：编译器看到类型是 char[4]，直接得出 4，运行时什么都不做。",
          "strlen(s)：运行时从 s[0] 开始往后扫，数到 s[3] 是 '\\0' 停下，返回 3。",
          "现在把 s 传进 void f(char arr[])：参数的实际类型退化成了 char*。",
          "于是函数里 sizeof(arr) 得到的是指针大小 8，原来那个 4 再也拿不回来了。",
          "所以只要需要在函数里知道长度，要么额外传长度参数，要么改用 std::array / std::vector / std::string_view 这类自带长度的类型。"
        ],
        pitfalls: [
          "在函数里对数组参数用 sizeof 求长度，拿到的是指针大小 —— 这是 C 风格代码里最经典的 bug 之一。",
          "把 sizeof(指针) 当成缓冲区大小传给 memcpy 或 strncpy，直接写越界。",
          "对 const char* p = \"abc\" 用 sizeof，得到的是指针大小而不是 4。",
          "用 strlen 的结果开缓冲区，却忘了给结尾的 '\\0' 多留一个字节。",
          "在循环条件里反复调用 strlen（for (i = 0; i < strlen(s); ++i)），把 O(n) 变成了 O(n²)。"
        ],
        cppCode: "char s[] = \"abc\";        // 内存里是 'a' 'b' 'c' '\\0'\nsizeof(s);               // 4  —— 编译期，看类型 char[4]\nstrlen(s);               // 3  —— 运行时，数到 '\\0' 为止\n\nconst char* p = \"abc\";\nsizeof(p);               // 8  —— 指针大小，不是字符串长度\nstrlen(p);               // 3\n\nvoid f(char arr[]) {\n    sizeof(arr);         // 8！参数已经退化成 char*，原长度丢失\n}\n\nvoid g(char* buf, size_t len);   // 正确做法：长度单独传进来\n\n// 现代 C++ 直接用自带长度的类型，这些坑一个都不存在\nstd::string      str = \"abc\";  str.size();   // 3\nstd::string_view sv  = \"abc\";  sv.size();    // 3，而且不拷贝\n",
        complexity: [
          "面试官问这题多半是想引到“数组退化成指针”这个点上，主动说出来会显得你真懂。",
          "结尾补一句“现代 C++ 用 string / string_view 就没这些问题”，能体现工程判断。"
        ]
      }),
      q("cpp-extern", "intermediate", false, "extern 的作用是什么？", ["extern", "链接", "声明与定义"], [
        "extern 的核心作用是把“声明”和“定义”分开：它告诉编译器“这个名字在别的地方定义，你先记住它的类型，别在这里分配内存”。",
        "打个比方，extern 就像跟编译器说“这个人在别的部门，我这儿只是提一下他的名字，不用给他发工资”。真正“发工资”（分配内存、生成符号）的是定义的那一处。",
        "最典型的用法是跨文件共享全局变量：在某个 .cpp 里定义，在头文件里用 extern 声明，其他文件包含这个头文件就能用。",
        "对函数来说 extern 本来就是默认的，所以函数声明前一般不写它。",
        "另一个常见用途是 extern \"C\"：它让编译器用 C 的方式做名字修饰（name mangling），这样 C++ 才能链接上 C 写的库；反过来要提供给 C 调用的接口也必须加。",
        "工程上的建议是尽量少用跨文件的可变全局变量：它们在模块之间制造隐藏耦合，还会带来静态初始化顺序不确定的问题。真需要共享状态，优先考虑显式传参或者带接口的单例。"
      ], {
        diagramSteps: [
          "在 config.cpp 里写 int g_port = 8080;，这是定义 —— 编译器在这里分配内存并生成符号。",
          "在 config.h 里写 extern int g_port;，这是声明 —— 不分配内存，只告诉编译器有这么个东西、类型是什么。",
          "main.cpp 包含 config.h 后编译，知道 g_port 存在且是 int，于是生成一个“待解决”的外部引用。",
          "到链接阶段，链接器把 main.o 里那个待解决的引用和 config.o 里的定义对上，程序才能跑起来。",
          "如果两个 .cpp 都写了 int g_port = 8080;（都是定义），链接器报 multiple definition。",
          "如果只有声明没有任何定义，链接器报 undefined reference —— 这两个报错正好对应“定义多了”和“定义少了”。"
        ],
        pitfalls: [
          "在头文件里写 int g_port = 8080;（这是定义不是声明），被多个 .cpp 包含就重复定义。",
          "写了 extern 声明却忘了在某个 .cpp 里给出定义，链接时 undefined reference。",
          "extern 声明的类型和定义处不一致，链接有时能过，运行时读出来的却是一堆乱值。",
          "C++ 调用 C 库时忘了 extern \"C\"，名字修饰方式不同，链接器找不到符号。",
          "依赖多个源文件里全局对象的初始化顺序 —— 标准不保证跨编译单元的顺序，这就是所谓的静态初始化顺序问题。"
        ],
        cppCode: "// ---- config.h ----\nextern int g_port;      // 声明：不分配内存\nvoid initConfig();      // 函数声明本来就是 extern，不用写\n\n// ---- config.cpp ----\n#include \"config.h\"\nint g_port = 8080;      // 定义：这里才真正分配内存\n\n// ---- main.cpp ----\n#include \"config.h\"\nint main() { return g_port; }   // 链接时和 config.o 里的定义对上\n\n// 链接 C 的库，或者提供给 C 调用的接口\nextern \"C\" {\n    #include <some_c_lib.h>\n}\nextern \"C\" void callable_from_c(int x);   // 用 C 的方式修饰名字\n\n// C++17 起，头文件里可以直接用 inline 定义全局量\ninline int g_version = 3;\n",
        complexity: [
          "这题背后真正考的是“声明和定义的区别”，以及编译和链接分别在做什么。",
          "能顺口说出 multiple definition 和 undefined reference 各自对应什么情况，会显得你真调过链接问题。"
        ]
      }),
      q("cpp-volatile", "intermediate", true, "volatile 是做什么用的？它能保证线程安全吗？", ["volatile", "线程安全", "atomic"], [
        "volatile 的意思是“每次访问都必须真的去读写内存，不许编译器把它优化掉或者缓存到寄存器里”。相当于告诉编译器：这个数你不许背下来，每次都得重新去看一眼。",
        "它存在的原因是编译器默认假设“没人在背后偷偷改这个变量”，于是可以把它读一次存进寄存器反复使用，甚至把看起来没有效果的循环整个删掉。而有些变量确实会被程序之外的东西改。",
        "真正该用它的场景只有三类：内存映射的硬件寄存器、信号处理函数里被修改的标志（配合 volatile sig_atomic_t）、以及和 setjmp/longjmp 相关的局部变量。",
        "它不能做的事要说清楚：不保证原子性（volatile int 的自增依然是读—改—写三步）、不阻止 CPU 乱序执行、不提供线程之间的可见性保证。所以它根本不是线程同步工具。",
        "这里最大的坑是跨语言混淆：Java 和 C# 的 volatile 带内存屏障语义，确实能用来做线程同步；C++ 的 volatile 完全没有这层含义。很多人把 Java 的经验直接搬过来就出事了。",
        "线程之间共享数据，正确的工具是 std::atomic 或互斥量。atomic 同时给你原子性和内存序保证，这恰好是 volatile 给不了的两样东西。"
      ], {
        diagramSteps: [
          "先写一个循环 while (!flag) {}，flag 是个普通全局变量。",
          "编译器分析后发现循环体里没人改 flag，于是把它读一次放进寄存器，甚至直接优化成死循环。",
          "加上 volatile，编译器每一轮都必须真的去内存里读一次 flag，循环才有可能退出。",
          "但这只解决了“编译器优化”这一层。",
          "CPU 还可能乱序执行、还有各级缓存，volatile 对这些完全无能为力，所以另一个线程的写入什么时候能被看见，仍然没有任何保证。",
          "换成 std::atomic<bool>，你同时拿到原子性和内存序，编译器和 CPU 两层都被约束住了，这才是线程安全的做法。"
        ],
        pitfalls: [
          "拿 volatile 当线程同步用，这是 C++ 里最常见的误用之一。",
          "把 Java / C# 的 volatile 语义套到 C++ 上 —— 那两门语言的 volatile 带内存屏障，C++ 的不带。",
          "以为 volatile 能让 ++ 变成原子操作，实际上它依然是读—改—写三步，随时可能被打断。",
          "该用 atomic 的地方用了 volatile，代码看起来能跑，但在高并发或者换个平台后随机出错，极难排查。",
          "反过来，在真正需要的地方（硬件寄存器、信号标志）漏写 volatile，程序一开优化行为就变了。"
        ],
        cppCode: "// ✗ 错误用法：拿 volatile 当线程同步\nvolatile bool ready = false;\nvoid producer() { data = 42; ready = true; }      // 顺序没有保证\nvoid consumer() { while (!ready) {} use(data); }  // 可能读到半成品\n\n// ✓ 正确做法：用 atomic，同时拿到原子性和内存序\nstd::atomic<bool> ready2{false};\nvoid producer2() {\n    data = 42;\n    ready2.store(true, std::memory_order_release);\n}\nvoid consumer2() {\n    while (!ready2.load(std::memory_order_acquire)) {}\n    use(data);   // 到这里才保证看得到 data = 42\n}\n\n// ✓ volatile 真正该出场的地方\n// 内存映射的硬件寄存器\nvolatile uint32_t* const reg = (uint32_t*)0x40001000;\n*reg = 1;   // 每次都必须真的写进去，不能被优化掉\n\nvolatile sig_atomic_t g_stop = 0;   // 信号处理函数里修改的标志\nvoid handler(int) { g_stop = 1; }\n",
        complexity: [
          "这题后面几乎必然跟一个追问：“那线程间共享变量该用什么？”答 atomic 或者锁。",
          "主动指出 Java 和 C++ 的 volatile 语义不同，是很有效的加分点。"
        ]
      }),
      q("cpp-virtual-destructor", "intermediate", true, "为什么基类析构函数通常要声明为 virtual？", ["析构", "virtual", "多态"], [
        "问题出现在“通过基类指针 delete 一个派生类对象”的时候：如果析构函数不是虚的，编译器只会按指针的静态类型去调用基类析构，派生类那部分资源就没人释放了。",
        "打个比方：清洁工只按合同上写的身份干活。合同上写着“基类”，他就只收拾基类那部分，派生类自己添置的东西原封不动留在那儿 —— 内存泄漏就是这么来的。",
        "加上 virtual 之后，delete 会通过虚表找到实际类型的析构函数，先执行派生类析构，再自动逐层往上执行基类析构，整个对象才被完整清理。",
        "严格说这比“泄漏”还要糟：标准规定这种情况是未定义行为，实际表现可能是泄漏，也可能直接崩溃。",
        "判断标准不是“所有基类都要虚析构”，而是“可能被当作多态基类、会通过基类指针删除的类才需要”。",
        "代价也要知道：一旦有虚函数，类就要带虚表指针，对象变大，也不再是平凡可析构的类型。所以纯数据聚合类型不该无脑加 virtual；如果一个类压根不打算被继承，更好的表达是直接标 final。"
      ], {
        diagramSteps: [
          "定义 Base 和 Derived，让 Derived 持有一份资源，比如一块 new 出来的缓冲区。",
          "写 Base* p = new Derived();，此时 p 的静态类型是 Base*，动态类型是 Derived。",
          "执行 delete p，编译器要决定调用哪一个析构函数。",
          "析构不是虚的：按静态类型走，只调用 ~Base()，Derived 的成员和资源完全没被处理。",
          "析构是虚的：通过虚表找到 ~Derived() 先执行，再自动调用 ~Base()，从派生到基类逐层清理。",
          "顺带记住顺序：构造是先基类后派生，析构正好相反，先派生后基类。"
        ],
        pitfalls: [
          "给根本不打算被继承的类无脑加虚析构，白白多出一个虚表指针，还破坏了类型的平凡性。",
          "虚析构本身也必须有定义（哪怕是 = default 或空实现），纯虚析构同样要提供函数体，否则链接不过。",
          "用 std::unique_ptr<Base> 管理派生对象时同样需要虚析构；shared_ptr 是个例外，它在构造时就记住了实际类型的删除器。",
          "在析构函数里调用虚函数：这时派生部分已经销毁，调用到的是基类版本，不会有多态效果。",
          "只记住结论“基类都要加 virtual”，遇到追问“那什么时候不用加”就答不上来。"
        ],
        cppCode: "struct Base {\n    virtual ~Base() = default;   // 打算被多态使用，就该是虚的\n};\n\nstruct Derived : Base {\n    Derived()  { buf_ = new char[1024]; }\n    ~Derived() { delete[] buf_; }   // 只有虚析构才保证它被调用\n    char* buf_ = nullptr;\n};\n\nBase* p = new Derived();\ndelete p;\n// 虚析构 ：先 ~Derived() 再 ~Base()，完整清理\n// 非虚析构：只调 ~Base()，buf_ 泄漏（标准上属于未定义行为）\n\n// 不打算被继承时，更好的表达是直接封死\nstruct Config final {\n    ~Config() = default;   // 不需要 virtual\n};\n\n// 例外：shared_ptr 构造时就记住了实际类型的删除器，\n// 所以即使 Base 没有虚析构，它也能正确析构\nstd::shared_ptr<Base> sp = std::make_shared<Derived>();\n// 但 unique_ptr 没有这个机制，仍然需要虚析构\nstd::unique_ptr<Base> up = std::make_unique<Derived>();\n",
        complexity: [
          "面试里最好把“什么时候需要”和“什么时候不需要”都说出来，只答“基类都要加”反而显得死板。",
          "能提到 shared_ptr 的类型擦除删除器这个例外，是很明显的加分点。"
        ]
      }),
      q("cpp-value-category", "advanced", false, "左值、右值、将亡值的区别是什么？", ["左值", "右值", "xvalue", "移动语义"], [
        "先记判断标准，比记定义有用：这个表达式有名字吗？能取地址吗？两个都能的基本就是左值。",
        "左值（lvalue）：有名字、有稳定的存储位置，可以取地址。变量、解引用后的 *p、返回左值引用的函数调用都算。",
        "纯右值（prvalue）：临时的计算结果，既没有名字也取不了地址。字面量 42、a + b 的结果、按值返回的函数结果都是。",
        "将亡值（xvalue）：本来是个左值，但被标记成“资源可以被搬走了”。最典型的就是 std::move(x) 的结果。",
        "用一个比方串起来：左值是有住址的居民；纯右值是临时工，活干完就走；将亡值是居民已经把家当打包放在门口，你可以直接搬走，不必再复制一份。",
        "这套分类真正的意义在于决定重载解析：同样一个参数，编译器会根据它是左值还是右值来选择拷贝构造还是移动构造。移动语义能成立，全靠这个分类。",
        "有个反直觉但很重要的点：右值引用变量本身是左值。void f(T&& x) 里的 x 有名字、能取地址，所以是左值；想继续传递它的“右值性”，必须再 std::move 或 std::forward 一次。"
      ], {
        diagramSteps: [
          "拿到一个表达式，先问两个问题：它有名字吗？能取地址吗？",
          "两个都能 → 左值。比如 int a = 1; 里的 a。",
          "都不能、只是个临时结果 → 纯右值。比如 42、a + 1、按值返回的 getValue()。",
          "有身份但被标记成可以搬空 → 将亡值。比如 std::move(a)。",
          "编译器据此挑重载：传左值时匹配 const T&（走拷贝），传右值时优先匹配 T&&（走移动）。",
          "这也解释了为什么 v.push_back(std::move(s)) 比 v.push_back(s) 快：前者只搬指针，后者要真的复制一份数据。"
        ],
        pitfalls: [
          "以为 std::move 会移动东西 —— 它其实什么也不做，只是把表达式转成右值，真正的移动发生在移动构造/移动赋值里。",
          "忘了“右值引用变量本身是左值”，转发时漏掉 std::forward，把移动悄悄退化成了拷贝。",
          "继续使用已经被移动走的对象：它处于有效但未指定的状态，只能给它赋新值或者析构。",
          "对 const 对象用 std::move：得到的是 const T&&，匹配不上移动构造，会静悄悄退化成拷贝。",
          "返回局部变量时画蛇添足写 return std::move(x);，反而妨碍了返回值优化。"
        ],
        cppCode: "int a = 1;\nint* p = &a;\n\na;              // 左值：有名字，能取地址\n*p;             // 左值\n42;             // 纯右值：临时值，取不了地址\na + 1;          // 纯右值\nstd::move(a);   // 将亡值：还是那个 a，但被标记成“可以搬空”\n\nvoid f(const std::string&);   // 接左值：只能拷贝\nvoid f(std::string&&);        // 接右值：可以移动\n\nstd::string s = \"hello\";\nf(s);              // 走第一个：s 是左值\nf(std::move(s));   // 走第二个：转成右值，可以把 s 的内存直接搬走\n\n// 反直觉的一点：右值引用变量本身是左值\nvoid g(std::string&& x) {\n    f(x);              // 走的是 const&！因为 x 有名字，是左值\n    f(std::move(x));   // 这样才走 &&\n}\n",
        complexity: [
          "这题很少单独停在概念上，后面必然接 std::move、完美转发和移动构造。",
          "能主动说出“右值引用变量本身是左值”，基本就说明你真的理解了这套分类。"
        ]
      })
    ],
    "C++ 知识直讲": [
      q("cpp-knowledge-this-pointer", "intermediate", true, "详细说明 C++ 里的 this 指针是什么，它到底指向哪里？", ["this", "this 指针", "成员函数", "对象模型"], [
        "可以把成员函数理解成一段所有对象共享的公共代码，而 this 就像系统在调用时偷偷塞进去的一张‘当前对象门牌号’。谁来调用这段代码，这张门牌号就指向谁。",
        "当你写 `box.set(42)` 时，编译器更接近于把它理解成 `Box::set(&box, 42)`。也就是说，this 本质上是一个隐式参数，保存当前对象的地址。",
        "在非静态成员函数里，this 的类型通常可理解为 `ClassName* const`。它指向的对象可以改，但 this 自己在这个函数执行过程中不会改指向别的对象。",
        "之所以不同对象调用同一个成员函数却能改到各自的数据，就是因为每次调用时传进来的 this 不同。函数代码只有一份，但 this 让它知道现在该操作哪块对象内存。",
        "如果成员函数被 `const` 修饰，那么 this 会变成指向常量对象的语义，也就是更接近 `const ClassName* const`，因此函数里不能随意修改普通成员。",
        "要注意 this 通常不是对象里单独额外存着的一块字段，它更像调用成员函数时由编译器传进去的隐藏参数；真正对象内存里放的是成员数据，若类有虚函数还常会有实现相关的 vptr。"
      ], {
        diagramSteps: [
          "先想象内存里有两个对象：`boxA` 和 `boxB`，它们各自占一块不同地址的数据区。",
          "类里的成员函数 `setValue` 并不会在每个对象里复制一份，它更像一段统一存放的说明书代码。",
          "当调用 `boxA.setValue(10)` 时，程序会把 `boxA` 的地址作为 this 传给 `setValue`，所以函数内部访问的是 `boxA` 那块内存。",
          "当调用 `boxB.setValue(20)` 时，进入的还是同一段函数代码，但这次 this 换成了 `boxB` 的地址，于是改到的是另一块对象内存。",
          "编译器生成成员函数调用代码时，会把对象地址放进约定好的参数位置，再让函数体通过 this 访问成员。",
          "所以 this 不是“指向函数”，而是“指向当前正在使用这段函数代码的那个对象本身”。"
        ],
        pitfalls: [
          "悬空 this：对象已经析构、异步回调还保留着 this，随后一访问成员就是典型 use-after-free。",
          "链式调用别误返回临时值：如果本来要持续操作同一个对象，通常返回 `*this` 的引用，而不是返回一个新对象副本。",
          "构造函数和析构函数里虽然能用 this，但此时对象还没完全构造好，或已经开始销毁，尤其别在这里依赖跨层级虚函数行为。",
          "`this == nullptr` 不是正常对象语义。通过空指针去调用非静态成员函数本身就是未定义行为，哪怕函数体里暂时没访问成员也不能依赖。"
        ],
        cppCode: "class Box {\npublic:\n    int value = 0;\n\n    void setValue(int newValue) {\n        this->value = newValue;\n    }\n};\n\nint main() {\n    Box boxA;\n    Box boxB;\n\n    boxA.setValue(10);\n    boxB.setValue(20);\n\n    // 更接近编译器视角的理解：\n    // Box::setValue(&boxA, 10);\n    // Box::setValue(&boxB, 20);\n}\n",
        complexity: [
          "这不是算法题，重点不在时间复杂度，而在理解成员函数调用的底层传参模型。",
          "如果面试官继续追问，可以顺着讲到 const 成员函数、static 成员函数没有 this、以及虚函数调用时 this 如何参与动态派发。"
        ]
      }),
      q("cpp-knowledge-static-no-this", "intermediate", true, "为什么 static 成员函数里不能直接使用 this？", ["static", "this 指针", "成员函数"], [
        "因为 static 成员函数不属于某一个具体对象，而是属于类本身，所以调用时没有‘当前对象地址’可以传入。",
        "普通成员函数默认会隐式收到 this，因此能访问对象里的普通成员；static 成员函数没有这个隐式参数，只能直接访问静态成员或通过对象/指针间接访问实例成员。",
        "如果把普通成员函数理解成 `Class::func(this, ...)`，那 static 成员函数更像普通的命名空间函数，只是被放进了类作用域里。",
        "所以 static 成员函数不能直接调用非静态成员，根因不是语法限制，而是它根本不知道你想操作哪一个对象。"
      ], {
        diagramSteps: [
          "非静态成员函数调用时，系统默认知道“当前是谁在调用”。",
          "static 成员函数调用时，只知道“哪个类被调用了”，并不知道“哪个对象在调用”。",
          "没有具体对象，自然就没有 this，也就无法直接定位某个对象里的普通成员变量。"
        ],
        pitfalls: [
          "最常见误区是把 static 成员函数当成“只是少了一个对象名的普通成员函数”。实际上它从调用模型上就没有 this。",
          "如果 static 函数里需要访问实例状态，就必须显式传对象、指针或引用进去，不要靠全局变量兜底。"
        ]
      }),
      q("cpp-knowledge-this-chain", "intermediate", false, "为什么很多链式调用会返回 `*this`？", ["*this", "链式调用", "返回自身"], [
        "链式调用的本质是：当前对象做完一次修改后，把自己再返回出去，让下一次调用还能接着作用在同一个对象上。",
        "this 是指针，`*this` 才是当前对象本身，所以常见写法是返回 `*this` 的引用，也就是 `ClassName&`。",
        "如果返回值而不是引用，就可能产生额外拷贝，链条里后续操作也未必还作用在原对象上。",
        "这类设计在字符串拼接、配置构造器、流式接口里非常常见，面试回答时最好顺手说明为什么通常返回引用而不是值。"
      ], {
        pitfalls: [
          "如果返回值而不是引用，链式调用很可能一直在操作副本，最后原对象并没有按预期被连续修改。",
          "如果返回对临时对象或已经失效对象的引用，后续链式调用会直接踩到悬空引用问题。"
        ],
        cppCode: "class Builder {\npublic:\n    Builder& setA(int value) {\n        a_ = value;\n        return *this;\n    }\n\n    Builder& setB(int value) {\n        b_ = value;\n        return *this;\n    }\n\nprivate:\n    int a_ = 0;\n    int b_ = 0;\n};\n\nint main() {\n    Builder builder;\n    builder.setA(1).setB(2);\n}\n",
        complexity: [
          "核心收益不是复杂度优化，而是接口表达更顺，能把多个配置动作串成一句。",
          "回答时可以补一句：如果函数返回的是临时对象或右值引用，还要额外考虑生命周期和移动语义。"
        ]
      }),
      q("cpp-knowledge-vptr-vtable", "advanced", true, "虚函数、vptr、vtable 之间到底是什么关系？", ["虚函数", "vptr", "vtable", "动态派发"], [
        "可以把 vtable 理解成一张“本类虚函数能力表”，表里记录了这个动态类型在各个虚函数槽位上应该跳到哪个实现。",
        "而 vptr 则更像对象身上的“目录指针”，对象一旦构造完成，通常就会带着一个指向自己所属虚表的指针。",
        "当你通过基类指针调用虚函数时，编译器不会直接写死目标函数，而是先沿着对象里的 vptr 找到虚表，再去表里取出对应槽位的函数地址。",
        "所以动态派发的关键不是“指针类型是什么”，而是“对象运行时真正的动态类型是什么”，因为 vptr 跟着对象走，不跟着变量声明走。",
        "回答这类题时要强调：vptr/vtable 是主流实现思路，不是标准强制的唯一实现，但工程上通常都这么理解。"
      ], {
        diagramSteps: [
          "先有一个基类 `Base`，里面声明虚函数 `show()`；再有一个派生类 `Derived` 重写它。",
          "`Base` 和 `Derived` 各自通常会有自己的虚表，里面记录本类型对应的虚函数入口。",
          "当 `Base* ptr = new Derived();` 时，虽然变量类型是 `Base*`，但对象内部的 vptr 会指向 `Derived` 那张虚表。",
          "此时调用 `ptr->show()`，程序会先从对象里拿到 vptr，再查虚表槽位，最后跳到 `Derived::show()`。",
          "所以多态调用的决定时机在运行时，而不是仅靠编译时看到的指针静态类型。"
        ],
        pitfalls: [
          "在构造函数和析构函数里调用虚函数时，动态派发不会按你想的“最派生类型”走，这里特别容易讲错。",
          "把对象按值传给基类会发生切片，后面再谈虚表和多态时就已经不是原来的派生对象了。"
        ],
        cppCode: "#include <iostream>\nusing namespace std;\n\nclass Base {\npublic:\n    virtual void show() {\n        cout << \"Base::show\" << endl;\n    }\n};\n\nclass Derived : public Base {\npublic:\n    void show() override {\n        cout << \"Derived::show\" << endl;\n    }\n};\n\nint main() {\n    Base* ptr = new Derived();\n    ptr->show();\n    delete ptr;\n}\n"
      }),
      q("cpp-knowledge-forwarding-reference", "advanced", true, "为什么 `T&&` 有时是右值引用，有时又叫万能引用或转发引用？", ["T&&", "万能引用", "转发引用", "引用折叠"], [
        "`T&&` 只有在模板类型推导或 `auto&&` 这类语境里，才可能成为转发引用。它最大的特点是：传左值时保持左值语义，传右值时保持右值语义。",
        "如果 `T` 不是通过推导得到，而是已经被明确写死，比如 `Widget&&`，那它就是普通右值引用，不再具备“左右都能接”的行为。",
        "真正让它看起来神奇的是引用折叠规则：左值传进来时，`T` 会被推成引用类型，最后折叠成左值引用；右值传进来时才会保留右值引用。",
        "它的工程价值主要体现在完美转发上，也就是中间包装层不改变调用者原本的值类别，避免多余拷贝或错误地把左值当右值。",
        "面试里最稳的说法是：不是所有 `&&` 都叫万能引用，只有“发生模板推导的 `T&&`”才是。"
      ], {
        diagramSteps: [
          "看模板函数 `template <typename T> void wrapper(T&& arg)`，先不要急着把 `&&` 直接认成右值引用。",
          "如果传入左值 `x`，编译器会把 `T` 推成 `int&`，于是参数类型变成 `int& &&`，再折叠成 `int&`。",
          "如果传入右值 `10`，编译器会把 `T` 推成 `int`，于是参数类型就是 `int&&`。",
          "这就是为什么同一份模板代码能同时接左值和右值，并且保留原来的值类别。"
        ],
        pitfalls: [
          "不是所有 `&&` 都是万能引用，只有发生模板推导的 `T&&` 或 `auto&&` 才有这种语义。",
          "包装层里如果直接把 `arg` 继续传出去而不用 `std::forward<T>(arg)`，右值信息就会丢掉。"
        ],
        cppCode: "#include <utility>\n\nvoid consume(int& value) {}\nvoid consume(int&& value) {}\n\ntemplate <typename T>\nvoid wrapper(T&& arg) {\n    consume(std::forward<T>(arg));\n}\n\nint main() {\n    int x = 1;\n    wrapper(x);   // 走左值版本\n    wrapper(10);  // 走右值版本\n}\n",
        complexity: [
          "这类题本身没有算法复杂度，考点是模板推导、引用折叠和完美转发的语义链条。",
          "如果继续追问，通常会延伸到 `std::move` 和 `std::forward` 的区别。"
        ]
      }),
      q("cpp-knowledge-smart-pointer-core", "intermediate", true, "智能指针的核心原理可以怎么形象理解？", ["智能指针", "unique_ptr", "shared_ptr", "weak_ptr"], [
        "可以把 `unique_ptr` 理解成“一把钥匙只归一个人保管”，谁拿着它，谁负责对象生命周期，不能随便复制，只能转移。",
        "`shared_ptr` 更像“多人合租同一套房”，内部会有一个引用计数控制块，只有最后一个持有者离开时，房子才真正被回收。",
        "`weak_ptr` 则像“门口登记簿”，它知道对象还在不在，但不参与所有权计数，因此能避免两个对象互相拿 `shared_ptr` 把彼此永远留住。",
        "所以智能指针解决的核心不是“语法更高级”，而是把所有权和释放时机从人脑记忆，收敛到类型语义里。",
        "如果面试官继续深挖，通常会问到控制块、循环引用、线程安全边界，以及为什么 `make_shared` 可能更高效。"
      ], {
        diagramSteps: [
          "先把裸指针世界想成：谁 new 的、谁 delete，经常靠约定和记忆，很容易漏。",
          "`unique_ptr` 把规则写死成“只能有一个拥有者”，因此析构时机很清楚。",
          "`shared_ptr` 在对象旁边再挂一个计数器，每复制一份共享指针，计数就加一；销毁一份就减一。",
          "当计数降到 0 时，说明没人再拥有这个对象了，资源才真正释放。",
          "如果两个对象互相持有 `shared_ptr`，计数会互相托住，此时就要把其中一边改成 `weak_ptr`。"
        ],
        pitfalls: [
          "最常见坑是循环引用：双向关系两边都用 `shared_ptr`，对象逻辑上不可达但计数永远不归零。",
          "智能指针解决的是所有权，不是线程安全。`shared_ptr` 控制块线程安全，不代表被管理对象天然线程安全。"
        ],
        cppCode: "#include <memory>\n\nstruct Node {\n    std::shared_ptr<Node> next;\n    std::weak_ptr<Node> prev;\n};\n\nint main() {\n    auto first = std::make_shared<Node>();\n    auto second = std::make_shared<Node>();\n\n    first->next = second;\n    second->prev = first;\n}\n"
      }),
      q("cpp-knowledge-object-layout", "intermediate", true, "对象大小、内存对齐、padding、空类大小这些点该怎么一起理解？", ["对象大小", "内存布局", "padding", "空类"], [
        "对象大小不是简单把成员大小直接相加，因为编译器往往还要考虑对齐要求，在成员之间或末尾补 padding。",
        "内存对齐的目的通常是让 CPU 更高效地访问数据，所以某些类型希望落在特定边界上，编译器就会据此调整布局。",
        "空类即使没有数据成员，大小通常也至少是 1，因为语言需要保证不同对象有可区分的地址。",
        "所以 `sizeof` 反映的是“这个类型实例在内存里要占多少字节”，不只是“你手写了多少成员”。",
        "工程上理解这些点很重要，因为它会影响序列化、网络协议映射、缓存友好性，以及对象数组的整体内存占用。"
      ], {
        diagramSteps: [
          "假设一个类里先放 `char`，再放 `int`，虽然成员只写了 1 + 4 个字节，但真实对象大小往往不是 5。",
          "原因是 `int` 通常希望按更大的对齐边界存放，编译器会在 `char` 后面补几个字节，让 `int` 落到合适位置。",
          "类整体结束后，编译器还可能再补尾部 padding，让对象数组里每个元素都能保持相同对齐。",
          "空类虽然看起来“什么都没有”，但为了让两个不同对象地址可区分，也通常会保留至少 1 字节占位。"
        ],
        pitfalls: [
          "别把成员大小直接相加当成对象大小，真正的 `sizeof` 经常会被对齐和尾部 padding 改写。",
          "如果把结构体直接映射网络协议或磁盘二进制格式，不说明布局约束就很容易出兼容问题。"
        ],
        cppCode: "#include <iostream>\nusing namespace std;\n\nclass Empty {};\n\nclass Sample {\npublic:\n    char ch;\n    int value;\n};\n\nint main() {\n    cout << sizeof(Empty) << endl;\n    cout << sizeof(Sample) << endl;\n}\n",
        complexity: [
          "这类题没有算法复杂度，核心是理解类型布局规则如何影响真实对象大小。",
          "如果项目涉及跨进程共享内存或二进制协议，还要额外关注对齐和编译器布局差异。"
        ]
      }),
      q("cpp-knowledge-lambda", "intermediate", true, "lambda 到底是什么？捕获列表、闭包对象和常见坑该怎么一起讲清楚？", ["lambda", "捕获列表", "闭包对象", "回调"], [
        "可以把 lambda 理解成“编译器帮你生成的一个匿名函数对象”。你写下的捕获变量，会变成这个匿名对象里的成员。",
        "捕获列表决定闭包对象内部存什么：值捕获是把当时的值拷进去，引用捕获是把外部变量的别名绑进去。",
        "lambda 本身不是普通函数指针；只有不捕获任何外部变量的 lambda，才可能退化成函数指针使用。",
        "当 lambda 被传进算法、线程池、异步回调时，真正关键的不是语法，而是闭包对象里那些被捕获成员的生命周期和可见性。",
        "面试里如果能讲清“lambda 是对象，operator() 是调用入口，捕获列表决定对象状态”，基本就已经比只会背语法强很多。"
      ], {
        diagramSteps: [
          "先看 `int x = 10; auto fn = [x]() { return x + 1; };`，编译器不会只生成一段裸函数代码。",
          "它更接近于生成一个匿名类，这个类里有一个成员保存被捕获的 `x`，还有一个 `operator()` 实现调用逻辑。",
          "如果是值捕获，闭包对象里存的是创建 lambda 那一刻的副本；如果是引用捕获，闭包对象里存的是对外部变量的引用语义。",
          "所以 lambda 调用时能不能安全访问外部数据，关键不在写法像不像函数，而在闭包对象里到底保存了什么。"
        ],
        pitfalls: [
          "异步回调里最容易踩的是引用捕获或捕获 this：外部对象已经销毁，闭包里还在访问旧地址。",
          "`[=]`、`[&]` 写起来很快，但会把真正捕获了什么藏起来，复杂代码里很容易把生命周期问题带进去。",
          "默认情况下 lambda 的 `operator()` 是 const 的，所以值捕获变量不能直接改；如果确实要改副本，需要 `mutable`。",
          "不要把“lambda 像函数”误解成“和函数没区别”。一旦有捕获，它本质上就是一个带状态的对象。"
        ],
        cppCode: "#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = 10;\n\n    auto byValue = [x]() {\n        return x + 1;\n    };\n\n    auto byRef = [&x]() {\n        x += 5;\n    };\n\n    cout << byValue() << endl;\n    byRef();\n    cout << x << endl;\n}\n",
        complexity: [
          "这类题没有算法复杂度，考点是闭包对象模型、捕获语义和生命周期风险。",
          "如果继续深挖，通常会延伸到泛型 lambda、`mutable`、捕获初始化以及和 `std::function` 的关系。"
        ]
      }),
      q("cpp-knowledge-move-forward", "advanced", true, "`std::move` 和 `std::forward` 到底在做什么，为什么经常一起出现？", ["move", "forward", "右值", "完美转发"], [
        "`std::move` 本身不搬运数据，它做的事情更接近于“把一个表达式显式转成右值语义”，告诉后续代码：这个对象的资源现在可以被拿走了。",
        "`std::forward` 则是“按原样转发”。它主要出现在模板包装层里，用来保留调用者原本传进来的左值/右值属性。",
        "如果说 `std::move` 是主动把对象标成可移动，那 `std::forward` 更像在说：我不要替调用者改主意，该是左值就继续按左值传，该是右值就继续按右值传。",
        "两者经常一起出现，是因为现代 C++ 很多封装层都想避免多余拷贝，同时又不想错误地破坏上游参数的值类别。",
        "面试里如果能把“move 改语义、forward 保语义”讲清楚，再配合模板推导场景，基本就不会答偏。"
      ], {
        diagramSteps: [
          "先看一个已有对象 `std::string name`，当你写 `std::move(name)` 时，并没有立刻发生移动构造，它只是把 `name` 转成了右值语义。",
          "后面如果某个构造函数或赋值函数接收到这个右值，才会真正选择移动版本，把内部资源接走。",
          "再看模板包装函数 `wrapper(T&& arg)`，如果这里统一对 `arg` 用 `std::move`，那左值实参也会被强行变成右值，这是错误的。",
          "所以模板里要用 `std::forward<T>(arg)`，让左值继续保持左值，右值继续保持右值。"
        ],
        pitfalls: [
          "最常见误区是把 `std::move` 理解成“真的发生了移动”。它只是类型转换，真正移不移动由后续重载解析决定。",
          "模板包装层里不要无脑对参数用 `std::move`，否则会把本来应该保留的左值语义破坏掉。",
          "对象被 move 之后通常仍然必须保持“有效但值未指定”的状态，不能默认它就等于空或还能按原值使用。"
        ],
        cppCode: "#include <string>\n#include <utility>\nusing namespace std;\n\nvoid consume(const string& value) {}\nvoid consume(string&& value) {}\n\ntemplate <typename T>\nvoid wrapper(T&& arg) {\n    consume(std::forward<T>(arg));\n}\n\nint main() {\n    string name = \"cpp\";\n    consume(std::move(name));\n\n    string topic = \"lambda\";\n    wrapper(topic);\n    wrapper(string(\"move\"));\n}\n",
        complexity: [
          "这类题没有算法复杂度，重点是区分值类别转换和真正资源转移发生的时机。",
          "继续追问时，常会延伸到转发引用、引用折叠、移动后对象状态和 noexcept。"
        ]
      }),
      q("cpp-knowledge-virtual-inheritance", "advanced", true, "虚继承到底在解决什么问题？为什么菱形继承里会提到它？", ["虚继承", "菱形继承", "对象模型", "重复基类"], [
        "虚继承主要是为了解决菱形继承里的“公共祖先基类被继承出多份”问题。",
        "如果没有虚继承，最底层派生类对象里可能会同时带着两份同一个祖先基类子对象，访问祖先成员时会出现二义性。",
        "用了虚继承之后，公共祖先基类会在最底层对象里只保留一份，多个中间层共享它。",
        "它解决的是对象模型层面的重复基类问题，但代价是对象布局、构造责任和指针偏移都会更复杂。",
        "所以虚继承不是“更高级的继承方式”，而是当继承结构已经走到菱形共享祖先时，用来消除重复基类的一种工具。"
      ], {
        diagramSteps: [
          "先想象 `Animal` 被 `Mammal` 和 `Winged` 同时继承，`Bat` 再同时继承 `Mammal` 和 `Winged`。",
          "如果普通继承，`Bat` 对象里可能会有两份 `Animal` 子对象，一份来自 `Mammal`，一份来自 `Winged`。",
          "这时访问 `Animal::age` 之类的成员就会出现“到底走哪一份”的问题。",
          "如果 `Mammal` 和 `Winged` 都对 `Animal` 使用虚继承，那么 `Bat` 最终只保留一份共享的 `Animal` 基类子对象。"
        ],
        pitfalls: [
          "最容易踩的坑是只记住“虚继承解决菱形继承”，但讲不清它到底消除了什么重复，以及代价是什么。",
          "虚继承后，最底层派生类通常承担虚基类初始化责任，这一点在构造函数题里很容易答错。",
          "如果项目里一上来就用多层复杂继承再靠虚继承补洞，往往说明设计已经偏重，很多场景更该回头考虑组合。"
        ],
        cppCode: "#include <iostream>\nusing namespace std;\n\nclass Animal {\npublic:\n    int age = 1;\n};\n\nclass Mammal : virtual public Animal {};\nclass Winged : virtual public Animal {};\n\nclass Bat : public Mammal, public Winged {};\n\nint main() {\n    Bat bat;\n    bat.age = 3;\n    cout << bat.age << endl;\n}\n",
        complexity: [
          "这类题没有算法复杂度，核心是对象布局和继承模型的正确理解。",
          "如果继续追问，通常会延伸到构造顺序、指针调整和虚基类初始化责任。"
        ]
      }),
      q("cpp-knowledge-std-function", "intermediate", true, "`std::function` 是什么？它和函数指针、lambda、模板回调相比怎么理解？", ["std::function", "函数对象", "回调", "类型擦除"], [
        "`std::function` 可以把“可调用对象”统一包成一个固定类型的盒子。函数指针、lambda、仿函数对象，只要签名能对上，都可以装进去。",
        "它的核心价值在于接口统一：你不需要把具体可调用对象类型暴露到外部，调用方只需要知道它能按某个签名被调用。",
        "背后的代价通常来自类型擦除，也就是为了屏蔽具体类型而引入的额外包装、间接调用以及有时的动态分配。",
        "如果性能特别敏感，或者回调类型可以在编译期确定，模板参数往往比 `std::function` 更轻；如果你要做通用回调存储，`std::function` 就更方便。",
        "面试里最好的回答方式不是说它“能装函数”，而是说清它解决的是“统一表示不同可调用对象”的问题，以及它的成本。"
      ], {
        diagramSteps: [
          "先看函数指针，它只能接住普通函数或不捕获的 lambda，类型能力比较窄。",
          "再看捕获 lambda，它其实是一个匿名对象，普通函数指针已经装不下它的状态。",
          "`std::function<void()>` 就像一个统一容器，只要对象支持 `operator()` 且签名匹配，就能被装进去。",
          "调用时外部不再关心里面到底是普通函数、lambda 还是仿函数对象，只关心这个盒子能不能被调用。"
        ],
        pitfalls: [
          "最常见误区是把 `std::function` 当成“零成本抽象”。它通常比模板回调更重，尤其在高频路径里要注意开销。",
          "空的 `std::function` 不能直接调用，调用前要么确保已绑定目标，要么先做有效性检查。",
          "如果只是一次性泛型回调传递，很多时候模板参数已经够了，不需要为了统一而强行用 `std::function`。"
        ],
        cppCode: "#include <functional>\n#include <iostream>\nusing namespace std;\n\nvoid runTask(const function<void()>& task) {\n    task();\n}\n\nint main() {\n    int value = 10;\n\n    runTask([value]() {\n        cout << value << endl;\n    });\n}\n",
        complexity: [
          "这类题没有算法复杂度，核心是理解类型擦除带来的统一性和运行时成本。",
          "如果继续深挖，通常会问到 small object optimization、拷贝语义和与模板回调的取舍。"
        ]
      }),
      q("cpp-knowledge-array-allocation", "intermediate", true, "数组内存分配时机与存放位置该怎么分场景讲清楚？", ["数组", "栈", "堆", ".data", ".bss", ".rodata", "编译期", "std::array"], [
        "核心结论：数组是否“编译期分配内存”、内存在哪，取决于定义位置、修饰符和大小，不能只看长度是不是常量。",
        "全局数组和函数内 static 数组：链接阶段划定虚拟地址，程序加载时由操作系统映射；未初始化进 `.bss`，初始化进 `.data`，生命周期随进程，不在栈也不在堆。",
        "普通局部栈数组：编译器只预计算栈帧偏移和占用字节；真正内存是函数调用时通过调整栈指针划出，返回后回收。长度即使编译期已知，也不等于编译期就分配实体 buffer。",
        "`constexpr` 长度只保证“长度是编译期常量、满足语法”，局部 `char arr[LEN]` 仍然是运行时栈分配。",
        "`new[]` 堆数组：编译期只有指针变量；运行期通过 `brk/mmap` 等向系统申请，需 `delete[]` 或 RAII 释放。",
        "字符串字面量本体在 `.rodata`，编译时已写入二进制；指针变量本身仍可能在栈或全局区。",
        "`std::array` 本质是定长数组封装：局部在栈，全局/static 在 data/bss；没有堆分配，长度必须编译期常量。"
      ], {
        diagramSteps: [
          "先看定义位置：全局/static、函数局部、new[]、字符串字面量，这四类决定主故事线。",
          "全局/static：程序加载时落在 `.data` 或 `.bss`，整进程常驻。",
          "函数局部原生数组/`std::array`：进入函数挪动栈指针划出，退出回收；过大可能栈溢出。",
          "`new char[N]`：运行时申请堆内存，指针变量另存，buffer 不在栈上。",
          "\"hello\" 这类字面量：字符数据进 `.rodata`，指针只是引用它。",
          "最后纠正误区：长度编译期确定 ≠ 编译期分配实体 buffer；分配时机由存储分区决定。"
        ],
        pitfalls: [
          "把“长度是 constexpr”误当成“编译期就分配好了缓冲区”。",
          "在函数里定义超大局部数组，例如数兆字节，直接踩 Linux 默认约 8MB 栈限制。",
          "把未初始化全局数组想成编译期就写满零字节进二进制；`.bss` 通常只记录大小，加载时再清零。",
          "C++ 标准不支持 VLA；`char arr[n]` 这种运行时长度是 GCC 扩展，面试里要说明不是标准写法。",
          "以为 `std::array` 会在堆上分配；它和原生定长数组一样，跟随对象本身的存储期。"
        ],
        cppCode: [
          "#include <array>",
          "",
          "char g_buf[2048];                 // 全局：.bss/.data，加载时分配",
          "const char* kLiteral = \"123456\"; // 字面量本体在 .rodata",
          "",
          "void demo(int n) {",
          "    static char sta_buf[2048];    // 函数内 static：仍是全局寿命",
          "    constexpr int LEN = 2048;",
          "    char stack_buf[LEN];          // 长度编译期可知，内存仍是运行时栈分配",
          "    std::array<char, 2048> arr;   // 局部 std::array：同样在栈上",
          "    char* heap_buf = new char[2048]; // 运行时堆分配",
          "    delete[] heap_buf;",
          "    // char bad[n];               // VLA：非标准 C++，勿当默认答案",
          "    (void)n; (void)sta_buf; (void)stack_buf; (void)arr;",
          "}"
        ].join("\n"),
        complexity: [
          "这不是算法复杂度题，重点是存储期、分配时机和区段。",
          "面试可接：栈溢出排查、BSS 与 DATA 区别、RAII 管理堆数组、为何交易系统慎用大栈对象。"
        ]
      }),
      q("cpp-knowledge-rodata", "intermediate", true, "`.rodata` 是什么？和 `.text` / `.data` / `.bss`、局部 const 有什么区别？", [".rodata", "只读段", "字符串字面量", "const", "ELF"], [
        "`.rodata` 是 ELF 里的只读常量数据段；程序加载后对应内存页通常被标成只读，误写会触发 SIGSEGV。",
        "常见内容：字符串字面量本体、全局 `const`/`constexpr` 常量、部分实现里的 vtable/RTTI、编译期固化常量等。",
        "和别的段对比：`.text` 放指令；`.data` 放已初始化可写全局/静态变量；`.bss` 放未初始化全局/静态变量（加载时清零）；栈和堆是运行时动态区。",
        "为什么单独放只读段：防误改常量、多进程可共享同一份物理页、常量固化进二进制启动即映射，不占堆栈动态分配。",
        "关键易错点：函数内 `const int a = 100` 通常在栈上，只是语法只读，强转指针仍可能改掉；真正进 `.rodata` 的是全局常量或字符串字面量本体。"
      ], {
        diagramSteps: [
          "先记四段：`.text` 指令、`.rodata` 只读常量、`.data` 已初始化可写、`.bss` 未初始化可写。",
          "看 `const char* s = \"hello\"`：`\"hello\"` 在 `.rodata`，指针 `s` 本身可能在栈或全局区。",
          "看全局 `constexpr int PORT = 8080` / `const double PI`：常量数据倾向落入只读区。",
          "看局部 `const int a = 100`：多数情况下在栈，不等于进了 `.rodata`。",
          "运行时若向只读页写：操作系统保护触发段错误，这正是只读段的价值。"
        ],
        pitfalls: [
          "把所有 `const` 都说成在 `.rodata`，忽略局部 const 常见在栈。",
          "混淆指针位置和所指对象位置：指针变量区段 ≠ 字符串字面量区段。",
          "把 `.bss` 说成编译期已经把全零写进文件；通常只记录大小，加载时清零。",
          "以为 `.rodata` 和 `.text` 一样只放代码；`.rodata` 放的是只读数据。"
        ],
        cppCode: [
          "constexpr int PORT = 8080;      // 全局常量，倾向 .rodata",
          "const double PI = 3.14159;",
          "",
          "void func() {",
          "    const int a = 100;          // 局部 const：通常在栈",
          "    constexpr int b = 100;      // 常被编译期折叠，未必占栈槽",
          "    const char* str = \"abc\";   // \"abc\" 在 .rodata，str 在栈",
          "    (void)a; (void)b; (void)str;",
          "}"
        ].join("\n"),
        complexity: [
          "面试背诵版：`.rodata` 放字面量/全局常量等只读数据，页只读防篡改，可跨进程共享；局部 const 不在这个故事里。",
          "可继续追问：如何用 `readelf -S` / `objdump -s -j .rodata` 验证，以及为何交易配置常量更适合固化只读。"
        ]
      }),
      q("cpp-knowledge-consteval", "advanced", true, "`consteval` 是什么？和 `constexpr` / `const` / `constinit` 怎么选？", ["consteval", "constexpr", "constinit", "C++20", "编译期"], [
        "`consteval` 是 C++20 的强制编译期函数：只能在编译期求值，禁止运行时调用；实参必须是编译期常量，否则直接编译失败。",
        "对比三兄弟：`const` 偏语法只读；`constexpr` 可编译期也可运行期（双模）；`consteval` 只允许编译期（单模强制）。",
        "工程价值：把固定计算（表生成、掩码、校验）前置到编译期，减少运行期 CPU；把阈值校验提前到编译失败，避免上线才崩。",
        "低延迟视角：结果常被折叠成立即数，少一次真实函数调用与分支，指令更干净。",
        "接口设计上可强制区分：端口、缓冲大小、协议魔数用编译期参数；行情价、委托量才是运行期数据。",
        "配套 `constinit`：保证静态变量初始化在加载时完成，帮助规避静态初始化顺序问题；常和编译期常量配置一起出现。"
      ], {
        diagramSteps: [
          "先写一个 `consteval int pow2(int x) { return x * x; }`。",
          "`constexpr int a = pow2(10);` 合法：编译期算出 100。",
          "`int n = 10; int b = pow2(n);` 非法：运行期实参，consteval 直接拒绝。",
          "换成 `constexpr` 函数：常量实参可编译期算，变量实参仍可运行期调用。",
          "选型口诀：要灵活用 `constexpr`；必须强制编译期校验/预计算用 `consteval`；静态初始化时序用 `constinit`。"
        ],
        pitfalls: [
          "把 `consteval` 和 `constexpr` 当成同义词，说不清“能不能运行时调用”。",
          "在必须接收运行期参数的热路径接口上误用 `consteval`，导致接口根本无法调用。",
          "以为编译期 `throw` 会变成运行异常；在 consteval/常量求值语境里它通常直接让编译失败。",
          "忽略 `constinit`：它不负责“只读”，而负责“静态初始化时机”。"
        ],
        cppCode: [
          "#include <cstddef>",
          "",
          "consteval int pow2(int x) {",
          "    return x * x;",
          "}",
          "",
          "consteval std::size_t check_buf_len(std::size_t len) {",
          "    if (len > 4096) {",
          "        throw \"缓冲区超限\"; // 常量求值失败 -> 编译期报错",
          "    }",
          "    return len;",
          "}",
          "",
          "constinit constexpr int g_port = 9999;",
          "",
          "int main() {",
          "    constexpr int a = pow2(10);          // OK",
          "    constexpr std::size_t BUF = check_buf_len(2048); // OK",
          "    char arr[BUF];",
          "    (void)a; (void)arr; (void)g_port;",
          "    // int n = 10; int b = pow2(n);     // 编译失败",
          "    // constexpr auto bad = check_buf_len(8192); // 编译失败",
          "}"
        ].join("\n"),
        complexity: [
          "面试背诵版：`consteval` 强制编译期，比 `constexpr` 更严；好处是预计算、编译期校验、少运行开销，适合固定配置与协议常量。",
          "交易/底层场景可举例：CRC 表生成、报文定长校验、端口/魔数固化、区分编译配置与运行业务数据。"
        ]
      }),
      q("cpp-knowledge-constexpr-vs-define", "intermediate", true, "`constexpr` 和 `#define` 有什么本质区别？业务里怎么选型？", ["constexpr", "#define", "宏", "编译期", "预处理"], [
        "`constexpr` 是编译期常量求值：变量、函数、构造都可以在编译期算出结果；`#define` 是预处理阶段的纯文本替换，没有类型、作用域和真正求值语义。",
        "执行阶段不同最本质：宏在预编译时字符粘贴；`constexpr` 在编译器解析后做常量求值。",
        "`const` 只保证只读，不一定是编译期常量；`constexpr` 变量必须编译期可确定，所以能做数组长度，而 `const int a = rand()` 不行。",
        "`constexpr` 函数是双态：常量实参可编译期算，变量实参可运行期调用；需要强制只能编译期时再上 `consteval`。",
        "宏的经典坑：运算符优先级、参数多次求值副作用、无类型难调试、全局污染易重名；`constexpr` 强类型、可作用域、可调试、参数只求值一次。",
        "选型：数值常量、数组长度、协议端口、类内阈值优先 `constexpr`；`#define` 只保留头文件保护、条件编译、依赖 `__FILE__`/`__LINE__` 的日志宏。"
      ], {
        diagramSteps: [
          "先画流水线：源码 → 预处理(#define) → 编译(constexpr 求值) → 汇编 → 链接。",
          "看宏坑：`#define NUM 1+2` 后 `NUM*3` 变成 `1+2*3=7`；换成 `constexpr int NUM=1+2` 得 9。",
          "看副作用：`GET_MAX(++x,2)` 宏可能让 `++x` 执行两次；`constexpr` 函数参数只求值一次。",
          "看作用域与调试：宏全局替换、gdb 难见宏名；`constexpr` 有符号可打印，遵循块/命名空间作用域。",
          "看实体：宏无内存可取；`constexpr` 常量常有符号，可进 `.rodata`，类内也能做 `static constexpr`。"
        ],
        pitfalls: [
          "把 `const` 和 `constexpr` 混为一谈，说不清谁能当数组长度。",
          "仍用宏写 `MAX(a,b)`，踩多次求值和优先级坑。",
          "以为所有 `constexpr` 函数都只在编译期执行，忽略变量实参时的运行期路径。",
          "把头文件保护和条件编译也强行改成 `constexpr`，这恰恰是宏仍该留下的场景。"
        ],
        cppCode: [
          "#define NUM 1+2",
          "#define GET_MAX(a, b) ((a) > (b) ? (a) : (b))",
          "",
          "constexpr int calc(int a, int b) {",
          "    return a + b;",
          "}",
          "",
          "struct Order {",
          "    static constexpr int BUF_SIZE = 2048;",
          "};",
          "",
          "int main() {",
          "    int a = NUM * 3;                 // 宏：1+2*3 = 7",
          "    constexpr int SAFE = 1 + 2;",
          "    int b = SAFE * 3;               // constexpr：9",
          "",
          "    constexpr int res1 = calc(10, 20); // 编译期",
          "    int x = 10, y = 20;",
          "    int res2 = calc(x, y);           // 运行期",
          "",
          "    int t = 1;",
          "    int m1 = GET_MAX(++t, 2);        // 宏可能多次 ++",
          "    char buf[Order::BUF_SIZE];",
          "    (void)a; (void)b; (void)res1; (void)res2; (void)m1; (void)buf;",
          "}"
        ].join("\n"),
        complexity: [
          "面试背诵抓五点：阶段、类型、作用域、副作用、实体；业务数值常量弃宏改 `constexpr`。",
          "可继续追问：`consteval` 与 `constexpr` 函数差异，以及为何交易协议定长/端口更适合编译期常量。"
        ]
      }),
      q("cpp-knowledge-explicit", "intermediate", true, "`explicit` 关键字到底防的是什么？资源类为什么几乎都要加？", ["explicit", "隐式转换", "单参构造", "RAII"], [
        "`explicit` 用来禁止构造函数参与隐式类型转换，只允许显式构造调用。",
        "单参构造最容易踩坑：`open(\"./log.txt\")` 可能被编译器隐式构造成 `FileGuard` 临时对象，带来意外资源创建/销毁。",
        "加上 `explicit` 后，必须写成 `open(FileGuard(\"./log.txt\"))`，意图清晰，避免“字符串自动变对象”。",
        "C++11 起，列表初始化触发的转换也会受 `explicit` 约束，不只是旧式拷贝初始化。",
        "交易/后端规范：文件句柄、socket、缓冲区、智能指针相关单参构造，默认都加 `explicit`。"
      ], {
        diagramSteps: [
          "先写无 explicit 的 `FileGuard(const char*)`，再写 `void open(FileGuard)`。",
          "调用 `open(\"./log.txt\")` 时，编译器自动走单参构造，生成临时 FileGuard。",
          "加 `explicit` 后，这条隐式路径被关掉，必须显式构造。",
          "业务含义：防止无意临时对象占用 fd/内存，又在表达式结束时立刻析构。"
        ],
        pitfalls: [
          "只给拷贝构造加 explicit，却忘了真正危险的单参转换构造。",
          "以为多参数构造永远不会隐式转换；列表初始化场景仍可能触发。",
          "为了“写起来短”去掉 explicit，结果接口出现隐蔽临时对象。"
        ],
        cppCode: [
          "struct FileGuard {",
          "    explicit FileGuard(const char* path) {}",
          "};",
          "",
          "void open(FileGuard fd) {}",
          "",
          "void demo() {",
          "    // open(\"./log.txt\");              // 有 explicit：编译失败",
          "    open(FileGuard(\"./log.txt\"));     // 显式构造：OK",
          "}"
        ].join("\n"),
        complexity: [
          "面试一句话：`explicit` 禁单参构造隐式转换，防无意临时对象和资源误创建。",
          "可接 RAII 句柄类、`unique_ptr` 构造为何也是 explicit。"
        ]
      }),
      q("cpp-knowledge-delete-copy", "intermediate", true, "`FileGuard(const FileGuard&) = delete` 每一段是什么意思？为何资源类要删拷贝？", ["=delete", "拷贝构造", "Rule of Five", "句柄"], [
        "完整语句 `FileGuard(const FileGuard&) = delete;` 表示：拷贝构造被显式删除，调用即编译失败。",
        "`const FileGuard&` 是源对象常引用，保证“如果允许拷贝”也不会改原对象；这里配合 `=delete` 直接禁止拷贝。",
        "`=delete` 是 C++11 语法：编译器不再生成可用版本；`=default` 则相反，请求编译器生成默认实现。",
        "资源类持有 `FILE*`/`fd` 时若允许拷贝，两个对象析构都会 close，造成二次关闭崩溃。",
        "实务上通常成对删除拷贝构造和拷贝赋值，需要转移时再写 move。"
      ], {
        diagramSteps: [
          "假设 FileGuard 内有 FILE*，拷贝后两个对象指向同一句柄。",
          "第一个析构 fclose，第二个再 fclose → 未定义行为/崩溃。",
          "写成 `= delete` 后，任何拷贝在编译期被拦住。",
          "若业务要传递所有权，改走移动构造，并把源对象句柄置空。"
        ],
        pitfalls: [
          "只删拷贝构造，不删拷贝赋值，赋值路径仍可能复制句柄。",
          "删了拷贝却忘了提供/默认移动，导致对象根本无法从函数返回。",
          "把 `=delete` 和 `=default` 说反：一个是禁用，一个是生成默认版。"
        ],
        cppCode: [
          "struct FileGuard {",
          "    FileGuard(const FileGuard&) = delete;",
          "    FileGuard& operator=(const FileGuard&) = delete;",
          "    FileGuard(FileGuard&&) noexcept = default;",
          "    FileGuard& operator=(FileGuard&&) noexcept = default;",
          "};"
        ].join("\n")
      }),
      q("cpp-knowledge-mutex", "intermediate", true, "`std::mutex` 底层是什么？lock/try_lock/unlock 该怎么理解？", ["mutex", "pthread_mutex", "锁", "死锁"], [
        "Linux 上 `std::mutex` 通常封装 `pthread_mutex_t`，属于操作系统提供的互斥原语。",
        "`lock()` 获取锁，已被占用则阻塞；`try_lock()` 非阻塞，失败立即返回 false；`unlock()` 释放锁。",
        "默认 mutex 不可递归：同一线程重复 `lock` 可能死锁；需要可重入再用 `recursive_mutex`。",
        "mutex 禁止拷贝（`=delete`），锁对象本身定义在哪（栈/全局/成员）内存就在哪，等待队列由内核维护。",
        "面试别只背接口：要能说清“互斥保护的是不变量”，以及为何要用 RAII 锁封装避免漏解锁。"
      ], {
        diagramSteps: [
          "线程 A lock 成功，进入临界区。",
          "线程 B lock 时发现锁被占，进入内核等待队列并让出 CPU。",
          "A unlock 后，内核唤醒等待者，B 再获得锁。",
          "若 A 再次 lock 同一把非递归锁，可能自我死锁。"
        ],
        pitfalls: [
          "在持锁时做耗时 IO，把锁变成全局性能瓶颈。",
          "忘记 unlock 或异常路径漏解锁；应用 `lock_guard`/`unique_lock`。",
          "多锁不加固定顺序，造成 ABBA 死锁。"
        ],
        cppCode: [
          "#include <mutex>",
          "",
          "std::mutex g_mtx;",
          "",
          "void critical() {",
          "    g_mtx.lock();",
          "    // ... 修改共享状态 ...",
          "    g_mtx.unlock();",
          "}"
        ].join("\n")
      }),
      q("cpp-knowledge-smart-ptr-backend", "intermediate", true, "后端/交易场景里 unique_ptr、shared_ptr、weak_ptr 该怎么完整对比？", ["unique_ptr", "shared_ptr", "weak_ptr", "RAII", "引用计数"], [
        "三者都是 RAII：用对象生命周期管理堆资源，避免手工 delete 漏释。",
        "`unique_ptr`：独占所有权，禁拷贝只 move；通常只多一个指针大小，无原子计数，低延迟首选。",
        "`shared_ptr`：共享所有权，另有控制块（强/弱引用计数、删除器）；拷贝会改计数，有原子开销，也可能循环引用。",
        "`weak_ptr`：不增加强引用，只观察；`lock()` 提升为 `shared_ptr`，用于打破环、缓存观察。",
        "选型：订单缓冲/独占 fd 用 unique；多处共享生命周期才 shared；破环用 weak。"
      ], {
        diagramSteps: [
          "unique：一把钥匙一个人拿，move 后原指针为空。",
          "shared：业务对象 + 控制块两坨堆内存，拷贝只增加计数。",
          "两个 Node 互相 shared_ptr 指对方 → 计数永不为 0 → 泄漏。",
          "把一边改成 weak_ptr → 不再托住对方 → 可正常释放。"
        ],
        pitfalls: [
          "默认滥用 shared_ptr，热路径被原子计数拖慢。",
          "循环引用只用 shared，不用 weak。",
          "从 shared 取裸指针长期保存，绕过生命周期管理。"
        ],
        cppCode: [
          "#include <memory>",
          "#include <cstdio>",
          "",
          "void demo() {",
          "    std::unique_ptr<char[]> buf(new char[2048]);",
          "    auto buf2 = std::move(buf); // buf 置空",
          "",
          "    std::unique_ptr<FILE, decltype(&fclose)> fp(fopen(\"log.txt\", \"a\"), &fclose);",
          "",
          "    auto p1 = std::make_shared<int>(1);",
          "    std::shared_ptr<int> p2 = p1; // use_count == 2",
          "    std::weak_ptr<int> w = p1;",
          "    if (auto locked = w.lock()) {",
          "        // 资源仍在",
          "    }",
          "}"
        ].join("\n")
      }),
      q("cpp-knowledge-lock-wrappers", "intermediate", true, "`lock_guard` / `unique_lock` / `scoped_lock` 怎么选？", ["lock_guard", "unique_lock", "scoped_lock", "RAII", "条件变量"], [
        "`lock_guard`：最简 RAII，构造 lock、析构 unlock；不能中途解锁、不能 defer，开销最小。",
        "`unique_lock`：可 defer_lock、手动 lock/unlock、try_lock、move；条件变量 `wait` 标配它。",
        "`scoped_lock`(C++17)：一次锁多把 mutex，按内部策略避免多锁顺序死锁。",
        "选型：简单临界区用 lock_guard；要中途解锁/配合 cv 用 unique_lock；同时拿多锁用 scoped_lock。",
        "共同价值：把解锁绑到作用域结束，避免 return/异常路径漏解锁。"
      ], {
        diagramSteps: [
          "lock_guard：进作用域上锁，出作用域自动解锁。",
          "unique_lock + condition_variable：wait 时原子释放锁并休眠，被唤醒后重新获锁。",
          "scoped_lock(m1,m2)：一次性管理两把锁，降低 ABBA 死锁概率。"
        ],
        pitfalls: [
          "拿 lock_guard 去配 condition_variable::wait（接口要求 unique_lock）。",
          "持 unique_lock 时间过长，把灵活变成负优化。",
          "多锁手写 lock 顺序不一致，却没用 scoped_lock 或统一顺序。"
        ],
        cppCode: [
          "#include <mutex>",
          "#include <condition_variable>",
          "",
          "std::mutex m1, m2;",
          "std::condition_variable cv;",
          "bool ready = false;",
          "",
          "void simple() {",
          "    std::lock_guard<std::mutex> lk(m1);",
          "}",
          "",
          "void wait_ready() {",
          "    std::unique_lock<std::mutex> lk(m1);",
          "    cv.wait(lk, [] { return ready; });",
          "}",
          "",
          "void both() {",
          "    std::scoped_lock lk(m1, m2);",
          "}"
        ].join("\n")
      }),
      q("cpp-knowledge-socket-guard", "intermediate", true, "如何用 RAII 封装 SocketGuard，避免 fd 泄漏？", ["SocketGuard", "RAII", "socket", "移动语义", "explicit"], [
        "SocketGuard 把 socket fd 绑到对象生命周期：构造接管，析构 `close`。",
        "单参构造加 `explicit`，禁止 `int` 隐式变 Guard。",
        "删除拷贝，避免双对象 close 同一 fd；提供 move，转移后源 fd 置 -1。",
        "任意 return/异常退出都会跑析构，降低 fd 耗尽风险。",
        "这是网络服务和交易网关里最常见的句柄管理模板。"
      ], {
        diagramSteps: [
          "accept/socket 得到 fd → 交给 SocketGuard。",
          "业务读写过程中提前 return。",
          "栈展开触发析构 → close(fd)。",
          "若 move 给另一对象，源对象不再负责关闭。"
        ],
        pitfalls: [
          "允许拷贝导致双重 close。",
          "move 后忘记把 other.fd 置无效，两边都 close。",
          "析构里 close 失败不处理日志，排障困难。"
        ],
        cppCode: [
          "#include <unistd.h>",
          "",
          "struct SocketGuard {",
          "    int fd{-1};",
          "    explicit SocketGuard(int sock_fd) : fd(sock_fd) {}",
          "    ~SocketGuard() {",
          "        if (fd >= 0) close(fd);",
          "        fd = -1;",
          "    }",
          "    SocketGuard(const SocketGuard&) = delete;",
          "    SocketGuard& operator=(const SocketGuard&) = delete;",
          "    SocketGuard(SocketGuard&& other) noexcept : fd(other.fd) { other.fd = -1; }",
          "    SocketGuard& operator=(SocketGuard&& other) noexcept {",
          "        if (this == &other) return *this;",
          "        if (fd >= 0) close(fd);",
          "        fd = other.fd;",
          "        other.fd = -1;",
          "        return *this;",
          "    }",
          "    int getfd() const { return fd; }",
          "};"
        ].join("\n")
      }),
      q("cpp-knowledge-string-vector-memory", "intermediate", true, "`std::string` 和 `std::vector` 的缓冲区是怎么管理的？SSO 是什么？", ["string", "vector", "SSO", "capacity", "扩容"], [
        "`string` 常有 SSO：短串（常见 ≤15）放对象内部缓冲，不走堆；长串才在堆上分配。",
        "长串/`vector` 都靠堆缓冲：size 是有效长度，capacity 是已分配容量，冗余容量减少频繁扩容。",
        "`vector` 典型三指针/三量：begin、size、capacity；满了通常按 1.5/2 倍扩容并迁移元素。",
        "`reserve` 预分配容量不构造元素；`resize` 改大小；`clear` 常不归还 capacity；`shrink_to_fit` 才请求回收。",
        "移动通常只转指针/元数据，避免深拷贝；热路径先 reserve，再批量写入。"
      ], {
        diagramSteps: [
          "短 string：字符躺在对象自身（栈/全局对象内部）。",
          "长 string/vector：对象里存指针，真实字符/元素在堆。",
          "push 到 capacity 满 → 分配更大堆区 → 迁移 → 释放旧区。",
          "先 reserve(N) 可把多次扩容变成一次分配。"
        ],
        pitfalls: [
          "循环 push_back 不 reserve，反复扩容拷贝。",
          "把 clear 当成释放堆内存。",
          "保存 vector 元素指针/迭代器后触发扩容，指针失效。"
        ],
        cppCode: [
          "#include <string>",
          "#include <vector>",
          "",
          "void demo() {",
          "    std::string short_s = \"hello\";      // 可能走 SSO",
          "    std::string long_s(64, 'x');         // 通常在堆",
          "    std::vector<int> v;",
          "    v.reserve(1024);",
          "    for (int i = 0; i < 1000; ++i) v.push_back(i);",
          "}"
        ].join("\n")
      }),
      q("cpp-knowledge-emplace-vs-push", "intermediate", true, "`emplace_back` 和 `push_back` 底层差别是什么？交易代码为何偏爱 emplace？", ["emplace_back", "push_back", "原地构造", "临时对象"], [
        "`push_back(Order(...))` 往往先造临时对象，再拷贝/移动进容器。",
        "`emplace_back(args...)` 把参数转发到容器内存里原地构造，少临时对象。",
        "`emplace` 是在指定位置原地构造；`emplace_back` 在尾部原地构造。",
        "已有现成对象时，`push_back(std::move(obj))` 也很清晰；不要为了“看起来高级”无脑替换。",
        "自定义订单/报文结构体批量入队时，优先 emplace_back 减少热路径开销。"
      ], {
        diagramSteps: [
          "push_back：栈上临时 Order → move/copy 进 vector 堆缓冲。",
          "emplace_back：直接在 vector 堆缓冲调用 Order 构造函数。",
          "少一次临时对象，就少一次构造/析构噪声。"
        ],
        pitfalls: [
          "对已经构造好的对象强行 emplace_back，可读性未必更好。",
          "emplace 参数列表写错，编译错误难读，不如先把对象造清楚。",
          "忽略扩容：无论 push/emplace，capacity 不够仍会搬迁。"
        ],
        cppCode: [
          "#include <vector>",
          "",
          "struct Order {",
          "    int id;",
          "    double px;",
          "    int qty;",
          "    Order(int i, double p, int q) : id(i), px(p), qty(q) {}",
          "};",
          "",
          "void demo() {",
          "    std::vector<Order> vec;",
          "    vec.reserve(128);",
          "    vec.push_back(Order(1001, 12.5, 100));     // 临时对象 + 移入",
          "    vec.emplace_back(1002, 13.0, 200);         // 原地构造",
          "}"
        ].join("\n")
      }),
      q("cpp-knowledge-process-memory-layout", "intermediate", true, "Linux 进程里栈、堆、`.data`/`.bss`/`.rodata`/`.text` 分别放什么？", ["栈", "堆", ".data", ".bss", ".rodata", ".text", "内存布局"], [
        "栈：局部变量、形参、返回地址等，函数进出自动分配释放；Linux 默认常约 8MB，过大局部数组易溢出。",
        "堆：`new/malloc`、容器长缓冲、shared_ptr 控制块等，手动或 RAII 释放，底层常走 brk/mmap。",
        "`.data`：已初始化全局/静态变量；`.bss`：未初始化全局/静态，加载时清零。",
        "`.rodata`：字符串字面量、全局常量等只读数据；`.text`：机器指令。",
        "举例：`const char* str=\"hello\"` 中字面量在 `.rodata`，指针变量本身按它的存储期落在全局或栈。"
      ], {
        diagramSteps: [
          "从上到下建立心智图：高地址栈向下长，堆向上长，中间是映射区。",
          "全局 int 未初始化 → `.bss`；全局 int=1 → `.data`。",
          "函数内 int a；`new int` → a 在栈，对象在堆。",
          "\"hello\" → `.rodata`；函数代码 → `.text`。"
        ],
        pitfalls: [
          "把局部 const 一律说成 `.rodata`。",
          "混淆指针所在区段和所指对象区段。",
          "在栈上开超大缓冲导致溢出，却怪“堆内存不够”。"
        ],
        cppCode: [
          "const char* g_str = \"hello\"; // 字面量 .rodata；g_str 在全局区",
          "int g_zero;                   // .bss",
          "int g_one = 1;                // .data",
          "",
          "void func() {",
          "    int a;                    // 栈",
          "    int* p = new int(2);      // p 在栈，*p 在堆",
          "    static int b;             // .bss/.data",
          "    delete p;",
          "}"
        ].join("\n"),
        complexity: [
          "可与数组分配、`.rodata`、智能指针条目对照复习，形成完整内存观。",
          "交易面试常接：为何热路径避免大栈对象、以及 RAII 如何依赖栈生命周期。"
        ]
      }),
      q("cpp-knowledge-raii", "intermediate", true, "RAII 到底是什么？交易/后端里该怎么落地？", ["RAII", "析构", "lock_guard", "unique_ptr", "异常安全"], [
        "RAII（Resource Acquisition Is Initialization）核心：资源获取放构造，资源释放放析构，用对象生命周期绑定资源生命周期。",
        "依托栈对象：进入作用域自动构造拿资源；函数 return、代码块结束、异常栈展开都会自动析构释放。",
        "解决的痛点：多分支 return、异常、break 导致手动释放漏写，造成泄漏、死锁、fd 耗尽。",
        "标准库范例：`lock_guard`/`unique_lock`/`scoped_lock` 管锁；`unique_ptr`/`shared_ptr` 管堆内存；容器内部缓冲也是同类思想。",
        "落地规范：禁裸 new/裸 fd/裸 lock-unlock 配对；资源类删拷贝、可移动；析构尽量 `noexcept`，释放逻辑不抛异常。"
      ], {
        diagramSteps: [
          "栈上创建 Guard → 构造：new/fopen/lock/接管 fd。",
          "业务中途 return 或抛异常 → 开始栈展开。",
          "局部 Guard 依次析构 → delete/fclose/unlock/close。",
          "对比手写释放：异常直接跳出时，后面的 delete/unlock 永远执行不到。"
        ],
        pitfalls: [
          "`new FileGuard(...)` 却忘 delete：堆上的 RAII 对象失去自动生命周期，违背初衷。",
          "允许拷贝导致两个对象托管同一 fd/同一块内存，析构二次释放崩溃。",
          "析构里抛异常，叠加栈展开可能直接 `terminate`。",
          "把 try-catch 和 RAII 对立：前者处理业务异常，后者兜底资源回收，常一起用。"
        ],
        cppCode: [
          "#include <cstdio>",
          "#include <mutex>",
          "#include <memory>",
          "",
          "struct OrderBuf {",
          "    char* buffer;",
          "    explicit OrderBuf(std::size_t len) : buffer(new char[len]{}) {}",
          "    ~OrderBuf() { delete[] buffer; buffer = nullptr; }",
          "    OrderBuf(const OrderBuf&) = delete;",
          "    OrderBuf& operator=(const OrderBuf&) = delete;",
          "    OrderBuf(OrderBuf&& other) noexcept : buffer(other.buffer) { other.buffer = nullptr; }",
          "    OrderBuf& operator=(OrderBuf&& other) noexcept {",
          "        if (this == &other) return *this;",
          "        delete[] buffer;",
          "        buffer = other.buffer;",
          "        other.buffer = nullptr;",
          "        return *this;",
          "    }",
          "};",
          "",
          "class FileGuard {",
          "    FILE* fp;",
          "public:",
          "    explicit FileGuard(const char* path, const char* mode) : fp(fopen(path, mode)) {}",
          "    ~FileGuard() { if (fp) fclose(fp); }",
          "    FileGuard(const FileGuard&) = delete;",
          "    FileGuard& operator=(const FileGuard&) = delete;",
          "    FILE* get() { return fp; }",
          "};",
          "",
          "std::mutex g_mtx;",
          "",
          "void demo() {",
          "    std::lock_guard<std::mutex> lk(g_mtx);",
          "    OrderBuf pkt(2048);",
          "    FileGuard log_fd(\"order.log\", \"a+\");",
          "    std::unique_ptr<char[]> p(new char[1024]);",
          "    // return / 异常都会自动解锁、释放缓冲、关文件",
          "}"
        ].join("\n"),
        complexity: [
          "面试背诵：构造获取、析构释放；栈生命周期兜底所有退出路径；lock_guard/unique_ptr 是标准 RAII。",
          "恒生向追问：撮合临界区为何 lock_guard、报文缓冲为何 unique_ptr、资源类为何禁拷贝改移动。"
        ]
      }),
      q("cpp-knowledge-noexcept", "advanced", true, "`noexcept` 到底优化什么？为何移动构造几乎必须加？", ["noexcept", "移动构造", "vector 扩容", "异常安全", "terminate"], [
        "`noexcept` 声明函数不会抛异常；编译器可少生成异常展开相关代码，指令更干净，适合低延迟路径。",
        "最关键场景：移动构造/移动赋值加 `noexcept`。`vector` 扩容时，只有 nothrow 移动才敢用移动，否则为异常安全会降级成拷贝。",
        "析构默认隐式 `noexcept(true)`；析构里抛异常通常直接 `terminate`，资源释放必须稳健。",
        "虚函数重写的 noexcept 属性必须兼容基类：基类已 noexcept，派生不能放宽成可抛。",
        "声明了 noexcept 却仍 throw：不会按普通异常捕获路径走，直接 `std::terminate`。",
        "规范：指针转移/swap/纯计算可 noexcept；内部有 `new`/可能失败的 IO 不要随便标；可用 `noexcept(expr)` 与 `is_nothrow_move_constructible` 做编译期判定。"
      ], {
        diagramSteps: [
          "vector 扩容：申请新缓冲后要迁移旧元素。",
          "若移动构造 noexcept：逐个 move，只转指针/句柄，快。",
          "若移动构造可抛：STL 为保原容器可回滚，改走拷贝，出现大块拷贝与尾延迟。",
          "自定义资源类手写移动时，成员都能 nothrow 转移，就显式写 `noexcept`。",
          "检测：`std::is_nothrow_move_constructible_v<T>` / `noexcept(T(std::move(x)))`。"
        ],
        pitfalls: [
          "移动函数标了 noexcept，内部却调用会抛的接口，一旦抛出直接 terminate。",
          "基类虚函数 noexcept，子类 override 漏写导致编译失败或语义不兼容。",
          "构造/业务函数里有 new，却强行 noexcept，`bad_alloc` 变成进程退出。",
          "以为编译器默认合成移动一定 noexcept；成员不满足时合成结果可能不是 nothrow。"
        ],
        cppCode: [
          "#include <type_traits>",
          "#include <utility>",
          "#include <vector>",
          "",
          "struct Order {",
          "    char* buf;",
          "    Order() : buf(new char[2048]) {}",
          "    ~Order() { delete[] buf; }",
          "    Order(const Order&) = delete;",
          "    Order& operator=(const Order&) = delete;",
          "    Order(Order&& other) noexcept : buf(other.buf) { other.buf = nullptr; }",
          "    Order& operator=(Order&& other) noexcept {",
          "        if (this == &other) return *this;",
          "        delete[] buf;",
          "        buf = other.buf;",
          "        other.buf = nullptr;",
          "        return *this;",
          "    }",
          "};",
          "",
          "void check_price_limit(Order& /*ord*/) noexcept {",
          "    // 纯字段判断，无分配、无抛点",
          "}",
          "",
          "template <typename F>",
          "void wrapper(F&& f) noexcept(noexcept(f())) {",
          "    f();",
          "}",
          "",
          "void demo() {",
          "    static_assert(std::is_nothrow_move_constructible_v<Order>);",
          "    std::vector<Order> vec;",
          "    vec.emplace_back();",
          "    vec.emplace_back(); // 扩容时走 noexcept 移动",
          "}"
        ].join("\n"),
        complexity: [
          "面试背诵：noexcept 承诺不抛；移动加它是为了容器扩容走移动而非拷贝；析构默认 noexcept；标了再抛就 terminate。",
          "恒生向追问：Order 进 vector 为何必须 nothrow move，以及风控纯计算接口为何适合 noexcept。"
        ]
      })
    ],
    "面向对象": [
      q("oop-overload-override-hide", "intermediate", true, "重载、重写、隐藏的区别是什么？", ["重载", "重写", "隐藏", "override"], [
        "三个词对应三种完全不同的机制，先各用一句话钉死：重载是同一个作用域里多个同名函数；重写是派生类替换掉基类虚函数的实现；隐藏是派生类的同名函数把基类所有同名版本挡在门外。",
        "打个比方：一家公司里有三位都叫「张经理」但分管不同业务，这是重载；子公司的张经理沿用总部这个职位、但换了做事方式，这是重写；子公司新来一个姓张的，从此总部所有姓张的都联系不上了，这是隐藏。",
        "重载的判定条件：同作用域、函数名相同、参数列表不同（个数、类型、顺序，以及成员函数尾部的 const）。只有返回类型不同不构成重载，编译器会报重定义。",
        "重写的四个硬条件缺一不可：基类函数是 virtual、函数名相同、参数列表完全相同、返回类型相同或协变。差一个 const 都不算，只会退化成隐藏。",
        "隐藏是最坑的一个：只要派生类里出现同名函数，不管参数列表一不一样、不管有没有 virtual，基类所有同名重载全部被挡住。用 `using Base::f;` 才能把它们捞回同一作用域。",
        "工程规范很简单：打算重写就一定写 `override`，让编译器替你验证那四个条件；确定不希望被继续重写就写 `final`。这两个关键字不改变行为，纯粹是让错误提前到编译期。"
      ], {
        diagramSteps: [
          "Base 里先有 void f(int) 和 virtual void g()。",
          "在 Base 里再加一个 void f(double)：同作用域、参数不同 —— 这是重载，调用时按实参类型选。",
          "Derived 里写 void g() override：虚函数且签名一致 —— 这是重写，通过 Base* 调用会走 Derived 的版本。",
          "Derived 里再写 void f(const char*)：名字撞上了 —— Base::f(int) 和 Base::f(double) 一起被隐藏。",
          "此时写 d.f(1) 不会去调 Base::f(int)，编译器只看得见 f(const char*) 这一个候选，于是尝试把 1 转成指针，报错或酿成事故。",
          "补一行 using Base::f; 后，三个 f 重新汇合到同一作用域，重载解析恢复正常。"
        ],
        pitfalls: [
          "以为参数列表不同就不会隐藏 —— 隐藏只看名字，跟参数完全无关，这是最常被忽略的一条。",
          "基类忘了写 virtual，派生类写得再像也只是隐藏；通过基类指针调用时走的仍是基类版本，行为和预期完全相反。",
          "签名差一个 const（基类 f(const T&)、派生类写成 f(T&)），本意是重写，实际变成隐藏。不写 override 的话编译器一声不吭。",
          "以为返回类型不同也能重载 —— 不能，只有返回类型不同会直接编译失败。",
          "重写时顺手改了默认参数值：默认参数在编译期按静态类型取，虚函数在运行时按动态类型走，两者会对不上，调出来的是基类的默认值配派生类的实现。"
        ],
        cppCode: [
          "struct Base {",
          "    void f(int);",
          "    void f(double);            // 与上一行构成重载",
          "    virtual void g();",
          "    virtual void h(const std::string&);",
          "};",
          "",
          "struct Derived : Base {",
          "    void g() override;         // 重写：virtual + 签名一致",
          "",
          "    // void h(std::string&) override;   // 编译失败：签名不符",
          "    // 若去掉 override，这行会静默退化成「隐藏」",
          "",
          "    void f(const char*);       // 隐藏：Base::f 两个版本全被挡",
          "    using Base::f;             // 捞回来，恢复重载解析",
          "};",
          "",
          "void demo(Base& b) {",
          "    b.g();                     // 虚调用 → Derived::g",
          "}"
        ].join("\n"),
        complexity: [
          "面试一句话：重载看参数，重写看 virtual 加签名，隐藏只看名字。三者的判定依据根本不在一个维度上。",
          "答完主动补一句「所以我们的规范是重写必写 override」，比只背定义更像真写过代码的人。"
        ]
      }),
      q("oop-polymorphism", "basic", true, "什么是多态？编译时多态和运行时多态分别是什么？", ["多态", "虚函数", "vtable", "模板"], [
        "多态的本质是「同一句调用代码，在不同时刻落到不同的函数上」。区分两种多态的关键，是「决定落到哪个函数」这件事发生在什么时候。",
        "编译时多态（静态）：编译期就能确定调谁 —— 函数重载、模板、CRTP 都算。零运行时开销、可以内联，但参与的类型必须在编译期全部已知。",
        "运行时多态（动态）：靠继承加虚函数，调哪个版本要等运行时看对象的真实类型。代价是一次间接跳转，换来的是可插拔和可扩展。",
        "比喻：编译时多态像开业前就把菜单印死了，服务员照着念；运行时多态像每张桌子上立一块牌子，服务员走到桌前才低头看牌子决定上什么菜。",
        "实现机制要能说清：含虚函数的类，每个对象里多一个 vptr 指向本类的虚函数表 vtable；一次虚调用就是「取 vptr → 查表取第 n 项 → 跳过去」，多两次内存访问。",
        "选型标准：类型集合编译期已知、追求极致性能，用模板；需要运行时替换实现、跨模块扩展、或者容器里要装异构对象，用虚函数。"
      ], {
        diagramSteps: [
          "定义 Shape 基类，里面有 virtual double area()，再派生出 Circle 和 Rect。",
          "编译器为 Shape、Circle、Rect 各生成一张 vtable，表里按固定顺序放着各自 area 的函数地址。",
          "构造 Circle 对象时，构造函数把对象头部的 vptr 指向 Circle 那张表。",
          "业务代码写 Shape* s = &c; s->area(); —— 编译期完全不知道 s 指向什么。",
          "运行时：先从对象里取出 vptr，再从表里取第 0 项，拿到 Circle::area 的地址，跳过去执行。",
          "换成 Rect 对象，这段调用代码一个字节都不用改，因为变的是 vptr 指向的那张表。"
        ],
        pitfalls: [
          "基类析构不是 virtual，却通过基类指针 delete 派生对象：只会调基类析构，派生类的资源全部泄漏。这是虚函数相关最常见的线上事故。",
          "在构造函数或析构函数里调虚函数：此刻 vptr 还停在（或已退回）当前这一层，调不到派生类版本，拿不到你以为的行为。",
          "按值传递多态对象导致对象切片，派生部分连同虚表信息一起被裁掉，多态直接失效。",
          "以为虚函数慢在那次间接跳转 —— 那点开销通常可以忽略，真正的代价是它挡住了内联，进而挡掉了内联之后本可以做的一连串优化。",
          "把重载误当成运行时多态：重载在编译期按静态类型选，跟对象的实际类型没有任何关系。"
        ],
        cppCode: [
          "struct Shape {",
          "    virtual ~Shape() = default;     // 多态基类必须虚析构",
          "    virtual double area() const = 0;",
          "};",
          "",
          "struct Circle : Shape {",
          "    double r;",
          "    explicit Circle(double r) : r(r) {}",
          "    double area() const override { return 3.14159 * r * r; }",
          "};",
          "",
          "// 运行时多态：编译期不知道 s 指向哪种形状",
          "double total(const std::vector<std::unique_ptr<Shape>>& v) {",
          "    double sum = 0;",
          "    for (const auto& s : v) sum += s->area();   // 查 vtable",
          "    return sum;",
          "}",
          "",
          "// 编译时多态：类型编译期定死，能内联，零间接跳转",
          "template <class T>",
          "double areaOf(const T& shape) { return shape.area(); }"
        ].join("\n"),
        complexity: [
          "面试一句话：编译时多态在编译期定、零开销；运行时多态查 vtable 在运行时定、换来可插拔。",
          "能顺手画出 vptr → vtable → 函数地址这条链，比只说「虚函数实现多态」深一层。",
          "被追问性能时，答「主要代价是阻止内联」而不是「多一次跳转」，更贴近真实情况。"
        ]
      }),
      q("oop-pure-virtual", "basic", true, "纯虚函数和抽象类是什么？", ["纯虚函数", "抽象类", "接口"], [
        "纯虚函数就是在虚函数声明后面加 `= 0`，含义是「这个能力我只规定签名，具体怎么做由派生类负责」。",
        "只要类里有哪怕一个纯虚函数（包括继承下来还没实现的），它就是抽象类，不能创建对象 —— 但可以有它的指针和引用，这正是多态要用的形式。",
        "比喻：抽象类像一份岗位说明书，写清「必须会做 X 和 Y」但不写怎么做；招进来的人（派生类）必须样样都会，缺一样就录用不了（编译不过）。",
        "一个高频误解：抽象类不等于纯接口。它完全可以有数据成员、普通成员函数、构造函数和默认实现，只是不允许直接实例化。",
        "纯虚函数也可以带函数体：派生类仍然必须重写，但可以显式写 `Base::f()` 来复用那份默认逻辑。而纯虚析构函数是必须给函数体的，否则派生类析构时链接失败。",
        "设计上的价值是依赖倒置：让业务代码只依赖抽象，不依赖具体实现。这是单元测试打桩、多套实现热切换的基础。"
      ], {
        diagramSteps: [
          "声明 Codec 基类，里面有 virtual int encode(...) = 0 和虚析构。",
          "因为带了 = 0，Codec 的 vtable 里那一槽填的是「纯虚调用」的占位地址，不指向任何真实函数。",
          "试着写 Codec c; —— 编译器直接拒绝：抽象类不能实例化。",
          "派生出 FixCodec 并实现 encode，它的 vtable 里那一槽被换成真实地址，于是可以实例化。",
          "如果 FixCodec 忘了实现 encode，它自己也仍然是抽象类，new FixCodec 同样编译失败 —— 漏实现根本溜不过编译期。",
          "业务代码全程只拿 Codec& 或 unique_ptr<Codec>，底下换成 FixCodec 还是 BinCodec，一行都不用改。"
        ],
        pitfalls: [
          "基类析构忘了 virtual：抽象类几乎注定要被多态删除，析构必须是 public virtual（或 protected 非虚，表示不允许多态删除）。",
          "以为抽象类不能有构造函数 —— 能有，而且派生类必须调它来初始化基类那部分。",
          "纯虚析构只写了 `= 0` 却不给函数体，链接期报 undefined reference，因为派生类析构结束时一定会去调它。",
          "在构造函数里调纯虚函数：派生类部分尚未构造，属于未定义行为，多数实现会直接以 pure virtual method called 崩溃。",
          "把抽象类和 Java 的 interface 划等号，忘了 C++ 里它可以带状态、带实现，也可以多重继承组合出接口。"
        ],
        cppCode: [
          "struct Codec {",
          "    virtual ~Codec() = default;    // 多态删除 → 必须虚析构",
          "    virtual int encode(const Order&, char* out) const = 0;",
          "",
          "    // 纯虚也能有默认实现，派生类显式调用来复用",
          "    virtual void reset() = 0;",
          "};",
          "",
          "void Codec::reset() { /* 公共清理逻辑 */ }",
          "",
          "struct FixCodec : Codec {",
          "    int encode(const Order&, char* out) const override;",
          "    void reset() override { Codec::reset(); /* 再做自己的 */ }",
          "};",
          "",
          "void run(Codec& c) { c.reset(); }   // 只依赖抽象",
          "",
          "// Codec c;                    // 失败：抽象类不能实例化",
          "// Codec* p = new FixCodec();  // OK：指针可以是抽象类型"
        ].join("\n"),
        complexity: [
          "面试一句话：`= 0` 表示只声明能力、不给实现；带纯虚函数的类不能实例化，但可以有指针和引用。",
          "主动补一句「抽象类可以有数据成员和默认实现」，能立刻和只背过 Java interface 的人区分开。"
        ]
      }),
      q("oop-access-control", "basic", true, "public、protected、private 的区别是什么？", ["访问控制", "封装", "继承方式"], [
        "这三个词其实管着两件事，先拆开就不会乱：一是成员访问权限（谁能碰这个成员），二是继承方式（基类成员到了派生类里降成什么权限）。",
        "成员权限：public 谁都能访问；protected 只有本类和派生类能访问，类外不行；private 只有本类和它的 friend 能访问，连派生类都碰不到。",
        "比喻：public 是接待大厅，谁都能进；protected 是员工通道，本公司和子公司的人能走；private 是老板的保险柜，只有他本人和他特批的人（friend）能开。",
        "继承方式的规则是「取更严格的那个」：public 继承保持原样；protected 继承把 public 降为 protected；private 继承把 public 和 protected 全降为 private。`class` 默认 private 继承，`struct` 默认 public。",
        "只有 public 继承才表达 is-a，也只有它允许派生类指针隐式转成基类指针。private / protected 继承表达的是「拿它来实现」，这种场合通常改用组合更清晰。",
        "还有一个容易被追问的点：访问控制是编译期检查，不是运行时的安全边界。它防的是误用，不防恶意 —— 强转指针照样能读到 private 数据。"
      ], {
        diagramSteps: [
          "类里分三段写：public 放对外接口，protected 放留给派生类的扩展点，private 放内部状态。",
          "类外的代码只看得见 public 那一段，其余访问在编译期就被挡掉。",
          "派生类能看到 public 和 protected，看不到 private —— 所以想让派生类改的状态，要么放 protected，要么给一个 protected 的访问函数。",
          "把继承方式改成 class D : private B，B 原本的 public 成员在 D 里全部变成 private。",
          "结果是 D 的使用者既看不到那些成员，D* 也不再能隐式转成 B*，多态那条路被彻底切断。",
          "选哪种的判据只有一条：D 能不能放在任何用 B 的地方？能就 public 继承，不能就说明它不是 is-a，该改成组合。"
        ],
        pitfalls: [
          "`class D : B` 忘了写 public：默认是 private 继承，于是派生类指针转不成基类指针，编译器抛出一堆看不懂的错误。这是新手最常卡住的地方。",
          "把 protected 数据成员当成「对派生类的善意」—— 它和 public 一样破坏封装，任何人写个派生类就能改你的内部状态。应优先 private 数据 + protected 函数。",
          "以为 private 能保证数据读不到 —— 它只是编译期检查，`reinterpret_cast` 之后照样读。",
          "为了复用实现而用 private 继承，继承层次越堆越深，组合往往更好维护。",
          "做权限分析时漏掉 friend 这条通道，它能直接穿透 private 和 protected。"
        ],
        cppCode: [
          "class Account {",
          "public:",
          "    void deposit(long cents);   // 大厅：谁都能调",
          "    long balance() const;",
          "",
          "protected:",
          "    virtual void onChanged();   // 员工通道：给派生类的扩展点",
          "",
          "private:",
          "    long cents_ = 0;            // 保险柜：只有本类和 friend",
          "    friend class AccountTest;   // 显式开一道门给测试",
          "};",
          "",
          "// class 默认 private 继承，漏写 public 是高频事故",
          "class Savings : private Account {};  // Savings* 转不成 Account*",
          "class Checking : public Account {};  // 这才是 is-a",
          "",
          "void demo(Account& a) { a.deposit(100); }",
          "// demo(savings);   // 失败：private 继承挡住了向上转换"
        ].join("\n"),
        complexity: [
          "面试一句话：public 对外、protected 对派生类、private 对自己；继承方式再把这整套权限统一收紧一档。",
          "主动指出「访问控制是编译期检查、不是安全机制」和「protected 数据同样破坏封装」，是两个明显的加分点。"
        ]
      }),
      q("oop-composition-vs-inheritance", "intermediate", true, "组合和继承如何选择？", ["组合", "继承", "is-a", "has-a"], [
        "判据只有一句话：能不能把派生类放进任何用基类的地方而不出问题？能就是 is-a，可以继承；只是想复用它的代码，那是 has-a，应该组合。",
        "比喻：继承是「我就是一台打印机」，别人递给你任何要打印机的活你都得能接；组合是「我办公室里放了一台打印机」，你借它干活，但没人指望你自己是打印机。",
        "继承带来的耦合是最强的一种：你继承了基类的全部接口、全部保护成员、全部行为契约，基类以后改任何一处都可能波及你，这就是所谓的脆弱基类问题。",
        "组合的好处是可替换和可测试：成员可以是接口指针，运行时注入不同实现，单测里换成假对象；继承来的东西没法在运行时换。",
        "「组合优于继承」不是说继承有罪，而是说继承的适用面窄得多 —— 它只在你确实需要运行时多态、且子类真的能替换父类时才划算。",
        "还有一条常被忽略的实务理由：继承会把基类的实现细节暴露给所有子类，日后想改基类的内部结构，得先确认几十个子类没有依赖它。"
      ], {
        diagramSteps: [
          "先问一句：Stack 是一种 vector 吗？不是 —— Stack 不应该支持随机插入删除。",
          "如果写 class Stack : public vector<int>，用户就能对 Stack 调 insert，栈的不变量当场被破坏。",
          "改成组合：class Stack { std::vector<int> v; }，只把 push/pop 转发出去，其余接口一概不暴露。",
          "反过来看 Circle 和 Shape：任何需要 Shape 的地方给一个 Circle 都成立，这才是 is-a。",
          "再看可替换性：组合的成员如果是 Logger*，运行时能换成 FileLogger 或 NullLogger；继承来的基类部分改不了。",
          "所以决策顺序是：先默认组合，只有确认需要运行时多态、且满足里氏替换时，才升级成 public 继承。"
        ],
        pitfalls: [
          "为了少写几行转发函数而继承，结果把不该暴露的接口一起继承了过来，破坏了自己的不变量。",
          "继承标准库容器（vector、string、map）：它们的析构函数不是虚的，一旦被多态删除就是未定义行为。",
          "以为组合一定要多写很多样板 —— 需要大批转发时可以用 private 继承加 using 声明，但这是折中，不是首选。",
          "把「代码能复用」当成继承的理由，忽略了继承同时也继承了行为契约，语义一旦对不上就会在别处爆炸。",
          "继承层次超过三层还在往下堆：调试时要跨好几个文件才能拼出一个函数的真实行为，维护成本远超省下的那点代码。"
        ],
        cppCode: [
          "// 反例：Stack 不是一种 vector",
          "class BadStack : public std::vector<int> {};",
          "// 用户能这么写，栈的不变量直接被破坏：",
          "// BadStack s; s.insert(s.begin(), 42);",
          "",
          "// 正例：组合，只暴露该暴露的",
          "class Stack {",
          "public:",
          "    void push(int v) { v_.push_back(v); }",
          "    void pop()       { v_.pop_back(); }",
          "    int  top() const { return v_.back(); }",
          "private:",
          "    std::vector<int> v_;",
          "};",
          "",
          "// 组合还能在运行时换实现，继承做不到",
          "class Engine {",
          "public:",
          "    explicit Engine(Logger* log) : log_(log) {}",
          "    void setLogger(Logger* log) { log_ = log; }   // 随时可换",
          "private:",
          "    Logger* log_;",
          "};"
        ].join("\n"),
        complexity: [
          "面试一句话：is-a 用继承、has-a 用组合；判据是里氏替换能不能成立，而不是代码能不能复用。",
          "主动举一个「Stack 继承 vector」的反例，比空谈原则有说服力得多。"
        ]
      }),
      q("oop-diamond", "advanced", true, "什么是菱形继承？虚继承解决了什么问题？", ["菱形继承", "虚继承", "二义性"], [
        "菱形继承指的是：B 和 C 都继承自 A，D 又同时继承 B 和 C，继承图画出来是个菱形。此时 D 里会有两份完整的 A 子对象。",
        "两份带来两个后果：一是访问 d.a_ 时编译器不知道你要哪一份，报二义性；二是对象白白变大，而且两份 A 的状态可能不一致。",
        "比喻：爷爷有两个儿子，两个儿子各自复印了一份家谱，孙子同时从两边继承 —— 手里就有两本家谱，翻的时候得先说清楚翻哪一本。",
        "虚继承（B 和 C 都写 `: virtual public A`）让编译器把 A 合并成唯一一份，二义性和状态不一致同时消失。",
        "代价不小：虚基类的构造由「最底层」那个类直接负责（D 要亲自初始化 A，B 和 C 对 A 的初始化被忽略），对象里还要多存虚基类指针或偏移，访问虚基类成员多一次间接寻址。",
        "实务上的态度：虚继承是解决问题的正确工具，但需要它往往说明继承层次已经太重了。C++ 里更常见的做法是「只对纯接口做多重继承」—— 接口没有数据成员，压根不会有两份状态的问题。"
      ], {
        diagramSteps: [
          "画出继承图：A 在顶上，B 和 C 各自继承 A，D 同时继承 B 和 C。",
          "不用虚继承时，D 的内存布局是 [B 里的 A][B 自己] [C 里的 A][C 自己] [D 自己] —— A 出现了两次。",
          "写 d.value（value 来自 A）时，编译器有两条路径可选，直接报 ambiguous；只能写 d.B::value 手动指定。",
          "改成 B 和 C 都虚继承 A：布局变成 [B 部分][C 部分][D 部分][唯一的一份 A]，位置由运行期偏移找到。",
          "构造顺序也随之改变：先构造虚基类 A（由 D 直接调用 A 的构造函数），再构造 B、C，最后 D。",
          "于是 B(int) 里写的 : A(x) 会被完全忽略 —— 如果 D 没有显式初始化 A，走的是 A 的默认构造。"
        ],
        pitfalls: [
          "以为写了虚继承就万事大吉，忘了虚基类必须由最派生类初始化，结果 A 悄悄走了默认构造，成员是默认值而不是你在 B 里传的那个。",
          "只在 D 处写 virtual 而不是在 B、C 处写 —— virtual 要加在「继承 A 的那一层」，加错位置完全无效。",
          "用 static_cast 在虚继承体系里从基类往派生类转：这是编译错误，只能用 dynamic_cast。",
          "在性能敏感路径上大量访问虚基类成员，忘了每次都要多一次间接寻址。",
          "为了共享几个字段就搬出虚继承，其实把公共部分做成一个成员对象（组合）通常更简单也更快。"
        ],
        cppCode: [
          "struct A { int value; explicit A(int v = 0) : value(v) {} };",
          "",
          "// 不用虚继承：D 里有两份 A",
          "struct B1 : A { B1() : A(1) {} };",
          "struct C1 : A { C1() : A(2) {} };",
          "struct D1 : B1, C1 {};",
          "// D1 d; d.value;        // 编译失败：二义性",
          "// d.B1::value == 1, d.C1::value == 2   // 两份状态不一致",
          "",
          "// 虚继承：A 只剩一份",
          "struct B2 : virtual A { B2() : A(1) {} };",
          "struct C2 : virtual A { C2() : A(2) {} };",
          "struct D2 : B2, C2 {",
          "    D2() : A(42) {}    // 虚基类必须由最派生类初始化",
          "};",
          "// D2 d; d.value == 42  // B2/C2 里写的 A(1)、A(2) 全被忽略"
        ].join("\n"),
        complexity: [
          "面试一句话：菱形继承导致两份基类子对象和访问二义性；虚继承把它合并成一份，代价是构造责任上移到最派生类，外加一次间接寻址。",
          "能主动说出「虚基类由最派生类初始化」这条规则，是这题真正的分水岭，大部分人只背得出「解决二义性」。",
          "补一句「所以多重继承尽量只用于无状态的纯接口」，能体现工程判断。"
        ]
      }),
      q("oop-constructor-order", "intermediate", false, "构造和析构的调用顺序是什么？", ["构造顺序", "析构顺序", "初始化列表"], [
        "构造顺序：先虚基类，再按声明顺序构造非虚基类，然后按「声明顺序」构造成员变量，最后才执行派生类构造函数的函数体。",
        "析构顺序严格相反：先跑派生类析构函数体，再按声明的逆序销毁成员，最后逆序析构基类。可以记成「先盖的楼后拆」。",
        "最容易踩的一条：成员的初始化顺序由它们在类里的「声明顺序」决定，跟你在初始化列表里的书写顺序毫无关系。写反了编译器通常只给个警告。",
        "为什么这么规定：只有这样才能保证析构时被依赖的部分还活着 —— 成员销毁时基类还在，基类销毁时它自己的成员还在。",
        "构造函数体里调虚函数拿不到派生类版本：此刻 vptr 还指向当前这一层，派生类部分尚未构造。析构时同理，vptr 已经退回来了。",
        "异常安全的关键推论：如果构造函数抛异常，已经构造完成的成员和基类会被正确析构，但这个对象自己的析构函数不会被调用 —— 因为它从来没构造成功过。"
      ], {
        diagramSteps: [
          "定义 struct D : B { M1 m1; M2 m2; D() : m2(...), m1(...) {} }。",
          "构造开始：先完整构造基类 B。",
          "再构造成员 —— 按声明顺序先 m1 后 m2，尽管初始化列表里 m2 写在前面。",
          "最后执行 D 的构造函数体，此时 vptr 才指向 D 的 vtable，虚调用从这一刻起才正常。",
          "析构时先跑 ~D() 的函数体，vptr 随即退回 B 那一层。",
          "然后按逆序销毁 m2、m1，最后调用 ~B()。整个过程恰好是构造的镜像。"
        ],
        pitfalls: [
          "初始化列表里 m2 依赖 m1，但 m1 在类里声明在后面 —— 实际先构造 m2，读到的是尚未初始化的 m1，典型的未定义行为。开 `-Wreorder` 能揪出来。",
          "在构造函数里调虚函数期待走派生类实现，实际调到的是当前层的版本；纯虚的话直接崩在 pure virtual method called。",
          "析构函数里抛异常：如果此时正在栈展开处理另一个异常，程序直接 terminate。析构函数应当 noexcept。",
          "构造函数抛异常后又在别处 delete 这个对象，导致重复释放 —— 构造失败的对象根本不存在，也不该被析构。",
          "以为在初始化列表里赋值和在函数体里赋值等价：函数体里那是「先默认构造再赋值」，对有资源的成员会多一次构造和析构。"
        ],
        cppCode: [
          "struct B { B() { puts(\"B\"); } ~B() { puts(\"~B\"); } };",
          "struct M { explicit M(const char* n) : n_(n) { puts(n_); }",
          "           ~M() { printf(\"~%s\\n\", n_); } const char* n_; };",
          "",
          "struct D : B {",
          "    M m1{\"m1\"};",
          "    M m2{\"m2\"};",
          "",
          "    // 写反了也没用：真实顺序永远看声明顺序",
          "    D() : m2(\"m2\"), m1(\"m1\") { puts(\"D\"); }",
          "    ~D() { puts(\"~D\"); }",
          "};",
          "",
          "// 输出顺序：",
          "//   B  m1  m2  D          ← 基类 → 成员(声明序) → 本体",
          "//   ~D  ~m2  ~m1  ~B      ← 完全镜像"
        ].join("\n"),
        complexity: [
          "面试一句话：基类 → 成员（按声明顺序）→ 本体；析构完全镜像。初始化列表的书写顺序不影响任何事。",
          "能补一句「构造失败的对象不会调自己的析构函数，但已构造完的成员会」，说明你真正理解了这套顺序背后的异常安全设计。"
        ]
      }),
      q("oop-object-slicing", "intermediate", false, "什么是对象切片？", ["对象切片", "slicing", "多态"], [
        "对象切片指的是：把派生类对象「按值」赋给或拷贝给基类对象时，派生类多出来的那部分被直接裁掉，只留下基类子对象。",
        "比喻：派生类是一个装在大盒子里的完整设备，基类变量是个小盒子。硬塞进去装不下，于是把伸出来的部分锯掉 —— 而且锯得悄无声息，编译器一句警告都不给。",
        "为什么必然发生：基类对象的大小在编译期就定死了，栈上或容器里只留了 sizeof(Base) 这么多空间，物理上放不下派生类的额外成员。",
        "后果不止是丢数据：拷贝进去的是基类的 vptr，所以对象的动态类型退化成了基类，之后所有虚调用都走基类版本 —— 多态彻底失效，而且失效得毫无提示。",
        "根治办法只有一条：多态对象一律用引用、指针或智能指针传递和保存，永远不按值。函数参数写 `const Base&`，容器里存 `unique_ptr<Base>`。",
        "想彻底堵死这个坑，可以把基类的拷贝构造和拷贝赋值设成 protected 或 delete，这样按值传递在编译期就过不去。"
      ], {
        diagramSteps: [
          "Derived 对象在内存里是 [vptr][基类成员][派生类成员]。",
          "写 Base b = d; 时，b 只有 sizeof(Base) 这么大，只能容纳 [vptr][基类成员]。",
          "拷贝执行的是 Base 的拷贝构造函数，它只认识基类那部分，派生类成员根本没被读取。",
          "更关键的是 b 的 vptr 被设成了 Base 的 vtable —— 不是拷贝过来的，是 Base 构造函数写进去的。",
          "于是 b.speak() 调的是 Base::speak，哪怕它的数据来自一个 Derived。",
          "换成 Base& r = d; 则不发生任何拷贝，r 只是 d 的别名，vptr 还是 Derived 的，虚调用正常。"
        ],
        pitfalls: [
          "函数参数写成 `void f(Base b)` 而不是 `void f(const Base& b)`：每次调用都静默切片，是这个坑最常见的入口。",
          "用 `std::vector<Base>` 装派生类对象：push_back 的一刻就切了，整个容器里全是基类对象。要存多态对象必须用 `vector<unique_ptr<Base>>`。",
          "把派生类对象按值 return 成基类类型，返回值优化也救不了，切片照样发生。",
          "以为加了 virtual 就不会切片 —— virtual 影响的是调用分发，跟按值拷贝时能放下多少字节完全是两回事。",
          "在 catch 块里写 `catch (BaseException e)` 而不是 `catch (const BaseException& e)`：异常对象也会被切片，派生异常的信息全丢。"
        ],
        cppCode: [
          "struct Base {",
          "    virtual ~Base() = default;",
          "    virtual void speak() const { puts(\"Base\"); }",
          "};",
          "struct Derived : Base {",
          "    int extra = 42;",
          "    void speak() const override { puts(\"Derived\"); }",
          "};",
          "",
          "Derived d;",
          "",
          "Base  b = d;   // 切片：extra 丢了，vptr 变成 Base 的",
          "b.speak();     // 输出 Base —— 多态没了，且没有任何警告",
          "",
          "const Base& r = d;",
          "r.speak();     // 输出 Derived —— 引用不拷贝，正常",
          "",
          "// 容器里存多态对象的正确姿势",
          "std::vector<std::unique_ptr<Base>> v;",
          "v.push_back(std::make_unique<Derived>());",
          "",
          "// 想在编译期堵死切片：",
          "// struct Base { Base(const Base&) = delete; ... };"
        ].join("\n"),
        complexity: [
          "面试一句话：按值拷贝多态对象时派生部分被裁掉，vptr 也退回基类，多态静默失效。",
          "主动补一句 `catch` 也要按引用接，说明你不只在函数参数这一个场景上想过这件事。"
        ]
      }),
      q("oop-friend", "intermediate", false, "friend 有什么作用？什么时候该谨慎使用？", ["friend", "封装", "运算符重载"], [
        "`friend` 的作用是在封装墙上开一道「指定」的门：被声明为友元的函数或类，可以访问本类的 private 和 protected 成员。",
        "比喻：private 是保险柜，friend 就是老板亲手配给某个人的一把钥匙 —— 是他主动给的、指名道姓给的，不是别人抢来的。这一点很关键：友元关系由被访问方声明，外部无法强行索取。",
        "三个真正合理的使用场景：一是对称的二元运算符重载（`operator<<`、`operator==`），写成成员函数会让左右操作数地位不对称；二是紧密协作的一对类（迭代器和它的容器）；三是给单元测试开一道口子。",
        "friend 的三条性质要记牢：不可传递（朋友的朋友不是朋友）、不可继承（父类的朋友不是子类的朋友）、单向（A 声明 B 是友元，不代表 B 里 A 也是友元）。",
        "它增加的耦合是实打实的：友元代码依赖的是你的「实现细节」而不是接口，将来改私有成员就得同步改所有友元。",
        "判断标准：如果通过增加一个公开成员函数就能优雅表达需求，就不要用 friend。只有当「加这个公开接口反而破坏封装」时（比如为了让 `operator<<` 能工作而把内部状态全 public 出去），friend 才是更小的恶。"
      ], {
        diagramSteps: [
          "类 Matrix 里有 private 的 data_ 数组。",
          "想写 `std::cout << m`，只能是非成员函数 —— 因为左操作数是 ostream，不是 Matrix。",
          "但非成员函数碰不到 data_，于是在 Matrix 里写 friend std::ostream& operator<<(std::ostream&, const Matrix&);",
          "编译器记下：这个特定签名的函数被授权访问 Matrix 的私有区。",
          "另一条路是给 Matrix 加一堆公开的 at()/rows()/cols()，让 operator<< 从外面拼 —— 但那等于把内部布局公开了，封装反而更差。",
          "所以这里 friend 是「更小的恶」：授权范围精确到一个函数，而不是对所有人开放。"
        ],
        pitfalls: [
          "以为友元关系能继承或传递：派生类访问不了基类的友元权限，友元的友元也进不来。",
          "把 friend 当成绕过设计问题的捷径，一个类挂七八个友元，等于 private 形同虚设。",
          "只为了单元测试就加 friend，把测试类名写死在生产代码里；更干净的做法是测公开行为，或者把需要测的逻辑拆成独立的自由函数。",
          "忘了友元函数不是成员函数：它没有 this，不能加 const 限定，也不参与虚函数分发。",
          "在类内定义友元函数后，以为可以在别处按普通函数直接调用 —— 类内定义的友元只能通过实参依赖查找（ADL）找到，不写在命名空间作用域里就 `Matrix::` 不到它。"
        ],
        cppCode: [
          "class Matrix {",
          "public:",
          "    Matrix(int r, int c);",
          "",
          "    // 左操作数是 ostream，只能是非成员函数",
          "    friend std::ostream& operator<<(std::ostream&, const Matrix&);",
          "",
          "    // 对称的比较，两边地位平等",
          "    friend bool operator==(const Matrix&, const Matrix&);",
          "",
          "private:",
          "    int rows_, cols_;",
          "    std::vector<double> data_;",
          "};",
          "",
          "std::ostream& operator<<(std::ostream& os, const Matrix& m) {",
          "    for (double x : m.data_) os << x << ' ';   // 摸得到 private",
          "    return os;",
          "}",
          "",
          "// 三条性质：不传递、不继承、单向",
          "// A 的朋友 B，B 的朋友 C —— C 进不了 A",
          "// A 的朋友 B，A 的子类 D —— B 进不了 D"
        ].join("\n"),
        complexity: [
          "面试一句话：friend 由被访问方主动授权，用来解决「成员函数表达不了、公开接口又代价太大」的场景，典型是对称运算符重载。",
          "能说出「不传递、不继承、单向」这三条性质，比只答「打破封装」具体得多。"
        ]
      }),
      q("oop-rule-of-five", "intermediate", true, "什么时候需要自己实现拷贝构造、移动构造和赋值函数？", ["rule of five", "rule of zero", "拷贝", "移动"], [
        "一句话判据：只要你自己写了析构函数、拷贝构造、拷贝赋值、移动构造、移动赋值中的「任何一个」，通常就该把这五个都想一遍。这就是 Rule of Five。",
        "背后的道理很朴素：你会亲手写其中一个，往往说明这个类「直接持有资源」（裸指针、fd、FILE*、锁、mmap 区域）。而编译器默认生成的拷贝是逐成员浅拷贝 —— 两个对象拿着同一个句柄，析构时释放两次，直接崩。",
        "比喻：默认拷贝像复印了一张寄存柜钥匙的照片，两个人都以为柜子是自己的，谁先走谁就把柜子清空了，后走的那位取到一柜子空气（或者直接崩溃）。",
        "还有一条容易忘的连带规则：一旦你声明了析构函数或任何拷贝操作，编译器就不再自动生成移动操作，你的类会静默退化成「只能拷贝」—— 性能悄悄变差，而且不报任何错。",
        "现代 C++ 的正确姿势是反过来的：优先追求 Rule of Zero —— 把资源交给 `unique_ptr`、`vector`、`string`、`lock_guard` 这些已经管好自己的成员，然后这五个函数一个都不写，全用编译器默认版本，既正确又不会漏。",
        "确实需要手写时，五个要成套出现，并且给移动操作加 `noexcept` —— 否则 `vector` 扩容时为了保证异常安全会退回用拷贝，你写的移动等于白写。"
      ], {
        diagramSteps: [
          "类里有一个裸 `char* buf_`，析构函数写了 delete[] buf_。",
          "只写了析构，没管拷贝：编译器仍然给你生成默认拷贝构造，逐成员复制 —— 复制的是指针值本身。",
          "于是 `Buf b = a;` 之后，a.buf_ 和 b.buf_ 指向同一块堆内存。",
          "作用域结束，b 先析构 delete[]，a 再析构又 delete[] 同一个地址 —— double free，程序崩溃或堆被破坏。",
          "补上拷贝构造（分配新内存再逐字节复制）和拷贝赋值（注意自赋值和先释放旧资源），double free 消失。",
          "再补移动构造和移动赋值（偷指针 + 把源置空 + noexcept），vector 扩容和函数返回时才不会做无谓的深拷贝。",
          "最后回头看：如果一开始就用 `std::vector<char> buf_`，上面这六步一步都不用做 —— 这就是 Rule of Zero。"
        ],
        pitfalls: [
          "只删了拷贝构造却忘了拷贝赋值，赋值这条路径照样能复制句柄。两个要成对处理。",
          "自己写了析构函数，导致移动操作被静默禁用，类退化成只能拷贝；性能变差却没有任何编译提示。",
          "移动构造忘了把源对象的指针置空：源析构时释放，目标之后再用就是悬空访问。移动的语义是「偷走并让源处于可析构的有效状态」。",
          "移动操作没标 noexcept：`vector` 扩容时会检查 `is_nothrow_move_constructible`，不满足就退回拷贝，你的优化被完全绕过。",
          "拷贝赋值没处理自赋值 `a = a`：先 delete 再拷贝，等于拷贝一块已经释放的内存。",
          "以为写了 `= default` 就万事大吉 —— 对裸指针成员来说，default 的行为就是浅拷贝，和不写一模一样。"
        ],
        cppCode: [
          "// 首选：Rule of Zero —— 一个都不用写",
          "class Good {",
          "    std::vector<char> buf_;      // 成员自己管好了自己",
          "    std::unique_ptr<Conn> conn_;",
          "};",
          "",
          "// 必须手写时：五个成套出现",
          "class Buf {",
          "public:",
          "    explicit Buf(size_t n) : n_(n), p_(new char[n]) {}",
          "    ~Buf() { delete[] p_; }",
          "",
          "    Buf(const Buf& o) : n_(o.n_), p_(new char[o.n_]) {",
          "        std::memcpy(p_, o.p_, n_);",
          "    }",
          "    Buf& operator=(const Buf& o) {",
          "        if (this == &o) return *this;        // 自赋值",
          "        Buf tmp(o);                          // copy-and-swap",
          "        swap(tmp);",
          "        return *this;",
          "    }",
          "",
          "    Buf(Buf&& o) noexcept : n_(o.n_), p_(o.p_) {",
          "        o.p_ = nullptr;  o.n_ = 0;           // 源必须置空",
          "    }",
          "    Buf& operator=(Buf&& o) noexcept {",
          "        if (this != &o) { delete[] p_; p_ = o.p_; n_ = o.n_;",
          "                          o.p_ = nullptr; o.n_ = 0; }",
          "        return *this;",
          "    }",
          "",
          "    void swap(Buf& o) noexcept {",
          "        std::swap(p_, o.p_);  std::swap(n_, o.n_);",
          "    }",
          "private:",
          "    size_t n_ = 0;",
          "    char*  p_ = nullptr;",
          "};"
        ].join("\n"),
        complexity: [
          "面试一句话：写了五个里的任何一个，就要把五个都过一遍；但更好的答案是「尽量一个都别写」，让成员自己管资源。",
          "主动提一句「移动操作必须 noexcept，否则 vector 扩容会退回拷贝」，是这题最能拉开差距的细节。",
          "被追问时能说出「声明析构会静默禁用移动」，说明你踩过或研究过这个坑。"
        ]
      }),
      q("oop-solid", "advanced", false, "面试里如何解释里氏替换原则？", ["SOLID", "里氏替换", "LSP", "行为契约"], [
        "里氏替换原则（LSP）说的是：任何使用基类对象的地方，换成派生类对象都应该照常工作，调用方不需要知道自己拿到的是哪一个。",
        "关键在于它约束的是「行为」，不是语法。编译器只检查签名对不对，检查不了「派生类有没有偷偷改变承诺」—— 那部分只能靠人。",
        "具体有四条可操作的检查项：派生类不能加强前置条件（不能要求更苛刻的输入）、不能削弱后置条件（不能少给承诺过的结果）、必须保持基类的不变量、不能抛出基类没声明过的异常类型。",
        "最经典的反例是「正方形继承长方形」：数学上正方形确实是一种长方形，但只要基类承诺了「设置宽度不影响高度」，正方形就做不到 —— 它一改宽度高度也跟着变，破坏了调用方依赖的那条不变量。",
        "另一个日常反例：基类 `Bird::fly()`，派生出企鹅，只能在 fly 里抛异常或空实现。这说明「会飞」根本不该放在 Bird 这一层，继承层次划错了。",
        "违反 LSP 的典型信号是调用方开始写 `if (dynamic_cast<Penguin*>(p))` 这类类型判断 —— 一旦要针对具体子类特判，多态就已经名存实亡，该考虑重新划分接口或改用组合了。"
      ], {
        diagramSteps: [
          "基类 Rectangle 提供 setWidth / setHeight，并隐含承诺两者互不影响。",
          "调用方基于这条承诺写测试：设宽 5、设高 4，断言面积等于 20。",
          "派生出 Square，为了维持正方形性质，setWidth 里顺手也改了 height。",
          "把 Square 传进那段代码：设宽 5 时高也变成 5，再设高 4 时宽又变成 4，面积成了 16。",
          "调用方一行没改，结果错了 —— 这就是违反 LSP 的准确定义：替换后行为不再正确。",
          "修法不是打补丁，而是承认二者不是 is-a：让 Square 和 Rectangle 各自实现一个只读的 Shape 接口，或者干脆用组合。"
        ],
        pitfalls: [
          "只用「签名一致 + 能编译过」判断继承是否合理，忽略了行为契约这一层。",
          "在派生类里对某些输入直接抛异常或什么都不做（空实现），本质上是削弱了基类承诺，属于典型违反。",
          "为了复用几个字段就继承，语义完全对不上，后面只能靠 dynamic_cast 特判来打补丁。",
          "派生类重写时收紧了参数校验（比如基类接受负数、派生类不接受），加强前置条件同样是违反。",
          "把 LSP 当成纯理论 —— 它其实有非常实际的判据：基类的所有单元测试，原封不动跑派生类应该也全绿。"
        ],
        cppCode: [
          "// 反例：语法完美，语义崩坏",
          "struct Rectangle {",
          "    virtual void setWidth(int w)  { w_ = w; }",
          "    virtual void setHeight(int h) { h_ = h; }",
          "    int area() const { return w_ * h_; }",
          "protected:",
          "    int w_ = 0, h_ = 0;",
          "};",
          "",
          "struct Square : Rectangle {",
          "    void setWidth(int w)  override { w_ = h_ = w; }",
          "    void setHeight(int h) override { w_ = h_ = h; }",
          "};",
          "",
          "// 基于基类承诺写的代码",
          "void check(Rectangle& r) {",
          "    r.setWidth(5);",
          "    r.setHeight(4);",
          "    assert(r.area() == 20);   // 传 Square 进来就炸：得到 16",
          "}",
          "",
          "// 判据：基类的测试原样跑派生类，应该全绿。",
          "// 跑不绿 —— 要么改设计，要么它本来就不是 is-a。"
        ].join("\n"),
        complexity: [
          "面试一句话：派生类必须能无声无息地替换基类；约束的是行为契约，不是函数签名。",
          "给出「基类的单元测试原样跑派生类要全绿」这个可操作判据，比复述定义有说服力得多。",
          "补一句「开始写 dynamic_cast 特判就是违反 LSP 的信号」，能把原则和日常代码味道连起来。"
        ]
      })
    ],
    "内存管理": [
      q("memory-new-vs-malloc", "basic", true, "new/delete 和 malloc/free 的区别是什么？", ["new", "malloc", "构造函数", "operator new"], [
        "最本质的一条：`malloc` 只管「要一块够大的生内存」，`new` 管「要内存 + 在上面把对象造出来」。`free` 只还内存，`delete` 先析构再还内存。",
        "比喻：`malloc` 是租了一间空毛坯房，钥匙给你，里面什么都没有；`new` 是租房加装修，交房时家具家电都装好了。退租时 `free` 直接交钥匙，`delete` 会先把家具搬走再交钥匙。",
        "类型和返回值也不同：`new` 返回的就是目标类型的指针，不用强转；`malloc` 返回 `void*`，在 C++ 里必须显式转换，而且要自己算 `sizeof`。",
        "失败方式完全不同：`malloc` 失败返回 `nullptr`，你得记得检查；`new` 失败抛 `std::bad_alloc`，不检查也不会静默走下去。想要返回空指针的行为得写 `new (std::nothrow) T`。",
        "`new` 其实是两步：先调用 `operator new` 拿内存（这一步通常就是包了 `malloc`），再在这块内存上调用构造函数。这两步可以拆开用，就是 placement new —— 内存池和容器都靠它在预分配的内存上原地构造对象。",
        "四者绝对不能交叉配对：`malloc` 配 `free`、`new` 配 `delete`、`new[]` 配 `delete[]`。配错了是未定义行为，可能当场崩，也可能安静地把堆结构破坏掉，几小时后在别处崩。"
      ], {
        diagramSteps: [
          "写 `Foo* p = new Foo(1);`，编译器把它拆成两步。",
          "第一步调 `operator new(sizeof(Foo))` 要一块生内存，这一步通常内部就是 malloc。",
          "第二步在这块地址上调用 Foo 的构造函数，成员被正确初始化，有虚函数的话 vptr 也在这时写入。",
          "写 `delete p;` 时同样两步，顺序相反：先调 `~Foo()`，再调 `operator delete(p)` 归还内存。",
          "换成 `Foo* q = (Foo*)malloc(sizeof(Foo));`：内存有了，但构造函数从没跑过 —— 成员是垃圾值，vptr 是垃圾，调虚函数直接飞。",
          "如果对 `new` 出来的对象用 `free`，析构函数不会被调用；对象内部持有的其它资源（文件、锁、堆内存）全部泄漏。"
        ],
        pitfalls: [
          "`malloc` 出来的内存直接当对象用：构造函数没跑，非平凡类型（有 string、vector 成员或虚函数的）立刻是未定义行为。",
          "`new` 出来的内存用 `free` 释放：析构函数被跳过，对象持有的其它资源全泄漏。",
          "`new[]` 配 `delete`：只析构第一个元素，而且很多实现会因为数组前面藏着元素个数而释放到错误的地址上。",
          "以为 `new` 会返回空指针所以写 `if (!p)` 判断 —— 默认版本抛异常，这个 if 永远进不去，属于无效防御。",
          "`realloc` 用在 C++ 对象数组上：它可能按字节搬内存，而 C++ 对象未必能安全地按位搬迁（比如 SSO 状态的 string 内部指针指向自己）。",
          "在有虚函数的类上用 `memset(this, 0, sizeof(*this))` 清零：把 vptr 也抹了，之后任何虚调用都会崩。"
        ],
        cppCode: [
          "struct Foo {",
          "    std::string name;",
          "    explicit Foo(const char* n) : name(n) {}",
          "    ~Foo() { /* 释放其它资源 */ }",
          "};",
          "",
          "// new = operator new（拿内存）+ 构造函数",
          "Foo* p = new Foo(\"ok\");",
          "delete p;              // = 析构函数 + operator delete",
          "",
          "// malloc 只有内存，构造函数从没跑过",
          "Foo* q = (Foo*)malloc(sizeof(Foo));",
          "// q->name 是垃圾值，碰它就是未定义行为",
          "free(q);               // 析构也不会跑",
          "",
          "// 两步拆开用：placement new，内存池的基础",
          "alignas(Foo) char buf[sizeof(Foo)];",
          "Foo* r = new (buf) Foo(\"pool\");   // 只构造，不分配",
          "r->~Foo();                        // 只析构，不释放",
          "",
          "// 失败方式不同",
          "int* a = (int*)malloc(n);         // 失败返回 nullptr",
          "int* b = new int[n];              // 失败抛 bad_alloc",
          "int* c = new (std::nothrow) int[n];   // 失败返回 nullptr",
          "",
          "// 现代写法：这三行都不用你自己写",
          "auto up = std::make_unique<Foo>(\"raii\");"
        ].join("\n"),
        complexity: [
          "面试一句话：malloc 只给内存，new 给内存加构造；delete 先析构再还内存，free 只还内存。配对必须严格对应。",
          "能主动把 `new` 拆成「operator new + 构造」两步，并顺势提到 placement new 和内存池，比只背四条区别深一层。"
        ]
      }),
      q("memory-raii", "basic", true, "什么是 RAII？为什么它在 C++ 中很重要？", ["RAII", "析构函数", "栈展开", "异常安全"], [
        "RAII = Resource Acquisition Is Initialization，直译是「资源获取即初始化」。这个名字起得不好，重点其实在它没说出来的后半段：资源的释放绑定在析构函数上。一句话说清就是把资源的生命周期挂到一个栈上对象的生命周期上。",
        "比喻：进酒店房间要押金换房卡，退房时前台自动退押金。RAII 就是让「退房」这个动作变成自动的 —— 不管你是正常走出大门，还是从消防通道跑掉（异常），押金都会退。",
        "为什么在 C++ 里格外重要：C++ 没有 GC，也没有 `finally`。手写 `delete`／`unlock` 意味着每一条退出路径都要记得写一遍 —— 正常 return、提前 return、抛异常，漏一条就泄漏。而析构函数是语言保证一定会被调用的。",
        "真正的杀手锏是异常路径。函数中间抛异常时会发生「栈展开」，栈上所有已构造对象的析构函数都会被依次调用；而手写的 `delete` 在抛出点之后，根本执行不到。",
        "适用范围远不止内存：锁（`lock_guard`）、文件（`fstream`）、socket、fd、数据库连接、线程 join（`jthread`）、临时改动的全局状态，都可以用同一套模式管起来。凡是「有借有还」的东西都适合。",
        "标准库里的 RAII 就是现成答案：`unique_ptr`、`shared_ptr`、`vector`、`string`、`lock_guard`、`fstream`。自己写 RAII 类时记住两点：析构函数不能抛异常；拷贝语义必须想清楚（通常删掉拷贝、只留移动）。"
      ], {
        diagramSteps: [
          "在函数里创建一个栈上的 Guard 对象，构造函数里完成资源获取：new / fopen / lock / accept。",
          "函数正常往下走，中途某处抛出异常，或者提前 return。",
          "编译器开始栈展开：从当前作用域往外，逐个调用已经构造完成的栈对象的析构函数。",
          "Guard 的析构函数被调用，delete / fclose / unlock / close 在这里执行 —— 无论走的是哪条路径。",
          "对比手写释放：如果 delete 写在函数末尾，异常直接跳出时那一行永远执行不到，资源就漏了。",
          "多个 Guard 时按构造的逆序析构，正好保证依赖关系正确（比如先解锁内层锁再解外层锁）。"
        ],
        pitfalls: [
          "`new FileGuard(...)` —— 把 RAII 对象自己 new 到堆上，它的生命周期又需要人来管，等于绕了一圈回到原点。RAII 对象要放栈上或作为成员。",
          "析构函数里抛异常：如果此时正在因另一个异常做栈展开，程序直接 `std::terminate`。析构函数应当是 noexcept 的。",
          "忘了删拷贝：两个 Guard 托管同一个 fd 或同一块内存，第二个析构时二次释放。",
          "写成 `std::lock_guard<std::mutex>(m);` 少了变量名 —— 这是一个立即销毁的临时对象，锁在这一行结束就放了，等于没锁。必须写 `lock_guard<mutex> lk(m);`。",
          "把 try-catch 和 RAII 对立起来：前者处理业务异常，后者兜底资源回收，正确的做法是两个一起用，而不是二选一。",
          "在构造函数里获取多个资源，中途失败时前面的没回滚 —— 应该每个资源各用一个 RAII 成员，让成员的析构自动处理。"
        ],
        cppCode: [
          "// 手写释放：异常一来就漏",
          "void bad() {",
          "    auto* p = new char[1024];",
          "    mtx.lock();",
          "    mayThrow();          // 抛了 → 下面两行永远到不了",
          "    mtx.unlock();",
          "    delete[] p;",
          "}",
          "",
          "// RAII：正常返回、提前 return、抛异常，都能正确清理",
          "void good() {",
          "    auto p = std::make_unique<char[]>(1024);",
          "    std::lock_guard<std::mutex> lk(mtx);",
          "    mayThrow();          // 栈展开时自动 unlock + 释放",
          "}",
          "",
          "// 自己写一个：删拷贝、析构 noexcept",
          "class FdGuard {",
          "public:",
          "    explicit FdGuard(int fd) noexcept : fd_(fd) {}",
          "    ~FdGuard() { if (fd_ >= 0) ::close(fd_); }",
          "",
          "    FdGuard(const FdGuard&) = delete;",
          "    FdGuard& operator=(const FdGuard&) = delete;",
          "",
          "    FdGuard(FdGuard&& o) noexcept : fd_(o.fd_) { o.fd_ = -1; }",
          "",
          "    int get() const noexcept { return fd_; }",
          "private:",
          "    int fd_ = -1;",
          "};",
          "",
          "// 经典事故：少写变量名 = 临时对象 = 根本没锁住",
          "// std::lock_guard<std::mutex>(mtx);   // ✗",
          "// std::lock_guard<std::mutex> lk(mtx);   // ✓"
        ].join("\n"),
        complexity: [
          "面试一句话：把资源生命周期绑到栈对象上，构造获取、析构释放；异常路径靠栈展开兜底，这是 C++ 没有 finally 却仍然异常安全的根本原因。",
          "主动举「少写变量名导致 lock_guard 立刻析构」这个坑，比复述定义更能说明你真用过。",
          "能补一句「析构函数必须 noexcept，否则栈展开中抛异常会 terminate」，是这题的加分项。"
        ]
      }),
      q("memory-smart-pointers", "intermediate", true, "shared_ptr、unique_ptr、weak_ptr 的区别和场景是什么？", ["智能指针", "所有权", "make_shared", "控制块"], [
        "三者的区别用一句话就能定位：`unique_ptr` 是「这东西归我一个人」，`shared_ptr` 是「大家共有，最后一个走的人负责关灯」，`weak_ptr` 是「我只是看看，不参与拥有」。",
        "比喻：`unique_ptr` 是房子唯一的一把钥匙，能转交（move）但不能复制；`shared_ptr` 是合租房，门口挂着一块计数牌，每来一个人加一，走一个减一，减到零才退租；`weak_ptr` 是知道地址的快递员 —— 他能来看看人还在不在，但他在不在场跟退不退租没关系。",
        "`unique_ptr` 应当是默认选择：它的大小就是一个裸指针（8 字节），没有任何运行时开销，编译后和手写 new/delete 一样快，却不会漏。只有当确实存在多个所有者、且谁最后释放无法在编译期确定时，才升级到 `shared_ptr`。",
        "`shared_ptr` 的代价要说得出来：对象本身 16 字节（一个指向对象的指针 + 一个指向控制块的指针）；控制块里有强引用计数和弱引用计数，都是原子变量，每次拷贝和析构都是原子操作，在多线程高频场景下并不便宜。",
        "`weak_ptr` 不增加强引用计数，所以不影响对象存活。它不能直接解引用，必须先 `lock()` 换成 `shared_ptr` —— 这一步是原子的，要么拿到有效的强引用，要么返回空，天然避免了「刚检查完就被别人释放」的竞态。",
        "`make_shared` 优先于 `shared_ptr<T>(new T)`：前者把控制块和对象合并成一次分配，更快、cache 更友好，也没有「new 成功但构造 shared_ptr 前抛异常」的泄漏窗口。唯一的代价是只要还有 weak_ptr 活着，那整块内存（含对象体）就不能归还。"
      ], {
        diagramSteps: [
          "`unique_ptr<T> a(new T)`：a 里就一个裸指针，没有计数，出作用域直接 delete。",
          "想转交所有权只能 `auto b = std::move(a);` —— a 变成 nullptr，全程没有引用计数的开销。",
          "`auto s1 = make_shared<T>()`：一次分配同时装下控制块和 T 对象，强计数 = 1，弱计数 = 1。",
          "`auto s2 = s1;` 强计数原子加到 2；s2 出作用域减回 1；s1 出作用域减到 0 → 调用 T 的析构函数。",
          "`weak_ptr<T> w = s1;` 只让弱计数加一，强计数不变，所以 w 完全不影响 T 什么时候死。",
          "强计数归零时对象立刻析构；但控制块要等弱计数也归零才释放 —— 这就是 weak_ptr 还能安全地问「对象还在吗」的原因。",
          "`w.lock()` 原子地检查强计数：非零就返回一个新的 shared_ptr（计数 +1），为零就返回空。"
        ],
        pitfalls: [
          "同一个裸指针建两个 shared_ptr：`shared_ptr<T> a(p), b(p);` 会产生两个独立的控制块，各自计数到零，对象被析构两次。要共享只能从已有的 shared_ptr 拷贝。",
          "在类内部想拿到指向自己的 shared_ptr 而直接写 `shared_ptr<T>(this)` —— 同样是第二个控制块。正确做法是继承 `enable_shared_from_this` 并用 `shared_from_this()`。",
          "把 `shared_ptr` 当默认选择：绝大多数场合所有权是清晰的，滥用会白白付出原子计数的开销，还会让「谁负责释放」这件事变得说不清。",
          "以为 `shared_ptr` 线程安全所以对象也线程安全：安全的只有引用计数，被指向对象的读写仍然要你自己加锁。",
          "循环引用：两个对象互持 shared_ptr，计数永远降不到零，对象逻辑上已不可达却析构不了。",
          "`unique_ptr<Base>` 管理派生对象时 Base 忘了虚析构 —— 只调基类析构。（`shared_ptr` 因为构造时记住了删除器，反而没这个问题。）"
        ],
        cppCode: [
          "#include <memory>",
          "",
          "// 默认选择：独占、零开销、8 字节",
          "auto u = std::make_unique<Conn>(\"127.0.0.1\");",
          "auto u2 = std::move(u);        // 转交，u 变成 nullptr",
          "// auto bad = u2;              // 编译失败：不能拷贝",
          "",
          "// 确实共享时才用：16 字节 + 原子计数控制块",
          "auto s1 = std::make_shared<Conn>(\"10.0.0.1\");",
          "{",
          "    auto s2 = s1;              // 强计数 1 → 2（原子）",
          "}                              // s2 析构，强计数回到 1",
          "",
          "// 只观察，不拥有",
          "std::weak_ptr<Conn> w = s1;",
          "if (auto sp = w.lock()) {      // 原子地拿强引用",
          "    sp->send();                // 拿到了，用起来就是安全的",
          "} else {",
          "    // 对象已经没了",
          "}",
          "",
          "// ✗ 两个独立控制块 → 二次析构",
          "// Conn* raw = new Conn();",
          "// std::shared_ptr<Conn> a(raw), b(raw);",
          "",
          "// ✗ 类内部这么写同样是第二个控制块",
          "// return std::shared_ptr<Self>(this);",
          "// ✓ 正确写法",
          "struct Self : std::enable_shared_from_this<Self> {",
          "    std::shared_ptr<Self> me() { return shared_from_this(); }",
          "};"
        ].join("\n"),
        complexity: [
          "面试一句话：unique_ptr 独占且零开销，是默认；shared_ptr 共享所有权，代价是原子引用计数；weak_ptr 只观察，用 lock() 安全取用。",
          "能说清 `shared_ptr` 是 16 字节、控制块里有强弱两个原子计数，比只说「引用计数」具体得多。",
          "主动提「同一裸指针建两次 shared_ptr 会有两个控制块」，是这题最典型的实战坑。"
        ]
      }),
      q("memory-cycle-reference", "intermediate", true, "为什么 shared_ptr 会产生循环引用？怎么解决？", ["循环引用", "weak_ptr", "引用计数"], [
        "根本原因在于 `shared_ptr` 用的是引用计数，而引用计数这套机制天生处理不了环 —— 它只知道「还有几个人引用我」，不知道「这几个人是不是从我自己绕回来的」。",
        "最简单的例子：A 持有指向 B 的 shared_ptr，B 也持有指向 A 的 shared_ptr。外部指针全部释放后，A 的计数还有 1（来自 B），B 的计数也还有 1（来自 A），谁都降不到零，两个都析构不了。",
        "比喻：两个人互相攥着对方的手不放，都说「等对方先松手我就走」。外面的人全走光了，这两位还在原地僵着，房间永远清不空。",
        "后果是内存泄漏，而且是最难查的那种：对象逻辑上已经不可达，`valgrind` 却能看到它「还被引用着」，不一定报成 definitely lost；只有靠对象计数或内存曲线才看得出来。",
        "解法是打破环的对称性：判断哪一侧是「拥有」，哪一侧只是「引用」，把非拥有的那一侧改成 `weak_ptr`。父子树里父指子用 shared、子指父用 weak；观察者模式里被观察者持有观察者的 weak_ptr。",
        "典型场景要记住三个：双向链表 / 树的父子指针、观察者与回调注册、以及 lambda 捕获了 `shared_from_this()` 又被存进对象自己的成员里（这是异步回调代码里最常见的一种自环）。"
      ], {
        diagramSteps: [
          "`auto a = make_shared<A>(); auto b = make_shared<B>();` —— 此时 a 的强计数 1，b 的强计数 1。",
          "`a->next = b;` —— b 的强计数变成 2。",
          "`b->prev = a;` —— a 的强计数变成 2。",
          "函数返回，局部变量 a、b 析构，两个强计数各自减一，都回到 1。",
          "外部已经没有任何指针能到达这两个对象了，但它们的计数都是 1 —— 互相撑着，析构函数永远不会被调用，内存泄漏。",
          "把 `prev` 的类型改成 `weak_ptr<A>`：`b->prev = a;` 只增加弱计数，a 的强计数仍是 1。",
          "于是局部变量析构时 a 的强计数归零 → A 析构 → A 里的 next 跟着析构 → b 的强计数归零 → B 也析构，整条链正确解开。"
        ],
        pitfalls: [
          "以为「我没写双向指针就不会有环」—— 环可以绕很长：A → B → C → A 同样成立，代码分散在三个文件里时极难发现。",
          "lambda 里捕获了 `shared_from_this()`，又把这个 lambda 存进对象自己的成员（回调列表、定时器句柄），形成自环。异步代码里这是头号泄漏源。",
          "把 `weak_ptr` 当成能直接用的指针：它不能解引用，必须 `lock()` 之后判空再用。",
          "用 `expired()` 判断之后再 `lock()`：两步之间对象可能正好被释放，是竞态。直接 `if (auto sp = w.lock())` 一步到位。",
          "随手把某一侧改成裸指针来「解决」循环引用：环是断了，但换来了悬空指针的风险，比泄漏更危险。",
          "改成 weak_ptr 后忘了对象真的可能已经没了，`lock()` 返回空时没有处理分支。"
        ],
        cppCode: [
          "#include <memory>",
          "",
          "// ✗ 双向都用 shared_ptr → 谁都析构不了",
          "struct BadNode {",
          "    std::shared_ptr<BadNode> next;",
          "    std::shared_ptr<BadNode> prev;",
          "    ~BadNode() { puts(\"never printed\"); }",
          "};",
          "",
          "// ✓ 拥有的一侧 shared，引用的一侧 weak",
          "struct Node {",
          "    std::shared_ptr<Node> next;   // 父/前驱拥有后继",
          "    std::weak_ptr<Node>   prev;   // 后继只是引用前驱",
          "    ~Node() { puts(\"destroyed\"); }",
          "};",
          "",
          "void demo() {",
          "    auto a = std::make_shared<Node>();",
          "    auto b = std::make_shared<Node>();",
          "    a->next = b;      // b 强计数 → 2",
          "    b->prev = a;      // 只加弱计数，a 强计数仍是 1",
          "",
          "    if (auto p = b->prev.lock()) {   // 一步到位，别先 expired",
          "        // 拿到了才用",
          "    }",
          "}   // a 强计数归零 → 整条链正确解开",
          "",
          "// 异步回调里最常见的自环：",
          "// timer_ = setInterval([self = shared_from_this()] { ... });",
          "// 对象持有 timer_，timer_ 持有 self —— 永远不释放。",
          "// 改成捕获 weak：",
          "// [w = weak_from_this()] { if (auto s = w.lock()) s->tick(); }"
        ].join("\n"),
        complexity: [
          "面试一句话：引用计数处理不了环，互持时计数降不到零；解法是判断谁拥有谁，把非拥有的一侧改成 weak_ptr。",
          "主动举「lambda 捕获 shared_from_this 存进自己成员」这个异步场景，比只说双向链表更贴近真实项目。",
          "补一句「用 if (auto sp = w.lock()) 而不是先 expired 再 lock」，能体现对竞态的敏感度。"
        ]
      }),
      q("memory-segments", "basic", true, "C++ 程序常见的内存区域有哪些？", ["栈", "堆", "全局区", ".bss", "地址空间"], [
        "常说的五块是：代码区 `.text`、只读常量区 `.rodata`、已初始化全局/静态区 `.data`、未初始化全局/静态区 `.bss`、以及运行时的堆和栈。另外还有 mmap 区域，动态库和大块 malloc 都落在那儿。",
        "先说一句最重要的前提：这些「区」全都在同一块物理内存上，分的是「虚拟地址空间」，不是不同的硬件。它们的区别在于「谁来分配、什么时候分配、权限是什么」。",
        "按来源可以干净地分成两类。四块来自可执行文件（ELF）：`.text` 只读可执行，`.rodata` 只读，`.data` 存初值非零的全局量，`.bss` 存初值为零的 —— 后者在文件里只记一个长度，不占文件空间，加载时由内核清零成整页，所以定义一个 10MB 的全局零数组不会让可执行文件变大 10MB。",
        "另外两块在运行时增长：栈由编译器自动管理，函数进出就是移动栈指针，快但容量小（Linux 默认 8MB，线程栈通常更小）；堆由 `malloc`／`new` 手动申请，容量受物理内存和 overcommit 策略限制，但每次分配都要走分配器，还会产生碎片。",
        "还有一层必须说清楚：虚拟地址不等于物理内存。`malloc` 成功只是拿到一段虚拟地址，真正的物理页要等你第一次写它、触发缺页中断时才分配。所以 `VSZ`（虚拟大小）和 `RSS`（实际占用）常常差很远。",
        "怎么亲眼看到：`size a.out` 看 text/data/bss 三段大小，`readelf -S` 看所有节，运行起来后 `cat /proc/<pid>/maps` 能看到每一段的地址范围和 `r-xp`／`rw-p` 权限位。"
      ], {
        diagramSteps: [
          "从低地址往高看：`.text`（r-x）→ `.rodata`（r--）→ `.data`（rw-）→ `.bss`（rw-）→ 堆（向上长）→ mmap 区 → 栈（向下长）→ 内核空间。",
          "`int g = 5;` 放进 `.data`，这个 5 实打实存在可执行文件里。",
          "`int g2;` 或 `int g3 = 0;` 放进 `.bss`，文件里只记「需要 4 字节」，加载时清零。",
          "`const char* s = \"hello\";` 里的 \"hello\" 在 `.rodata`，只读；改它会段错误。而指针 s 本身在 `.data`。",
          "函数里的 `int x;` 在栈上，进函数时栈指针一减就有了，出函数一加就没了 —— 没有任何分配器参与。",
          "`new int[1000]` 从堆上要，分配器要维护元数据、找空闲块，比栈慢得多；大块（通常 ≥128KB）会直接走 mmap。",
          "关键一步：堆上这 4000 字节此刻可能一个物理页都没占，等你真去写它，缺页中断才把物理页帧挂上来。"
        ],
        pitfalls: [
          "以为 `.bss` 里的大数组「不占内存」—— 它不占「文件」空间，运行时照样要物理页，一写就实打实占上。",
          "在栈上开大数组（几 MB）或写深递归：栈只有 8MB 且线程栈更小，溢出时不一定报错，可能直接踩到别的内存。大缓冲区应该上堆或用 `vector`。",
          "返回局部变量的地址：函数一返回那段栈就作废了，虽然内容可能一时还在，读到的是随时会被覆盖的垃圾。",
          "试图修改字符串字面量：`char* p = \"abc\"; p[0] = 'A';` 写的是 `.rodata`，段错误。要可改就写 `char p[] = \"abc\";`。",
          "把 `VSZ` 当成真实内存占用去做容量规划 —— 该看的是 `RSS`。",
          "以为「堆比栈慢」只是因为分配器：更大的差别在局部性，栈顶那几十字节几乎总在 L1 里，堆上的对象则可能散落各处。"
        ],
        cppCode: [
          "int    g_init   = 5;      // .data （初值非零，占文件空间）",
          "int    g_zero   = 0;      // .bss  （文件里只记长度）",
          "int    g_arr[1024*1024];  // .bss  （4MB，但文件不变大）",
          "const int g_ro  = 42;     // .rodata（只读）",
          "static int s_cnt = 0;     // .bss，但只在本翻译单元可见",
          "",
          "void f() {",
          "    int x = 1;                    // 栈：进出函数就是移栈指针",
          "    static int calls = 0;         // .bss！不在栈上，跨调用保留",
          "    ++calls;",
          "",
          "    char small[64];               // 栈，很快",
          "    auto big = new char[10 << 20];// 堆（10MB，多半走 mmap）",
          "",
          "    const char* lit = \"hello\";    // 字面量在 .rodata",
          "    // lit[0] = 'H';              // 段错误：只读",
          "    char buf[] = \"hello\";         // 这份是栈上的副本，可改",
          "",
          "    delete[] big;",
          "}",
          "",
          "// 惰性映射：这一行几乎不占物理内存",
          "char* p = (char*)malloc(1 << 30);   // VSZ +1GB，RSS 几乎不变",
          "p[0] = 1;                           // 现在才真的分配一页(4KB)",
          "",
          "// 观察命令：",
          "//   size a.out              → text / data / bss",
          "//   readelf -S a.out        → 所有 section",
          "//   cat /proc/<pid>/maps    → 运行时每段地址与权限"
        ].join("\n"),
        complexity: [
          "面试一句话：四段来自 ELF（text/rodata/data/bss），两段运行时增长（堆/栈），全部是同一块物理内存上的虚拟地址划分。",
          "主动补一句「.bss 不占文件空间但运行时占内存」和「malloc 成功不等于占了物理内存，VSZ ≠ RSS」，这两点最能区分背过和理解过。"
        ]
      }),
      q("memory-leak", "basic", true, "什么是内存泄漏？常见原因有哪些？", ["内存泄漏", "valgrind", "ASan", "RSS"], [
        "定义要说准：申请的内存「不再可达」（没有任何指针能找到它）却也「没有被释放」，这块内存到进程退出前都拿不回来，这才叫泄漏。",
        "有一类更隐蔽的情况严格说不算泄漏但危害一样：内存还可达、只是永远不会再用了 —— 比如一个只增不减的缓存、一个忘了清理的全局 map。工具查不出来，内存曲线却一路上涨，实务上通常合称「内存增长问题」。",
        "常见原因可以归成五类：一是裸 new 后异常路径或提前 return 跳过了 delete；二是 `shared_ptr` 循环引用；三是容器只插不删（缓存、会话表、待重发队列）；四是配对错误（`new[]` 配 `delete`、`malloc` 配 `delete`）；五是非内存资源泄漏（fd、锁、线程），后果往往比内存更严重。",
        "对长时间运行的服务，泄漏是最典型的慢性病：每笔请求漏几十字节，压测半小时看不出来，线上跑两周就 OOM。所以判断标准不是「内存有没有涨」，而是「稳定流量下内存是否收敛」。",
        "排查手段分层：开发期用 ASan（`-fsanitize=address`）几乎零成本地跑单测；测试期用 `valgrind --leak-check=full` 拿完整调用栈；线上用 tcmalloc/jemalloc 的 heap profile 看是哪个调用栈在涨，配合 `/proc/pid/status` 的 `VmRSS` 观察趋势。",
        "定位方法上有一条经验：先看内存曲线是「阶梯式上涨后平台」还是「持续线性上涨」。前者多半是缓存或内存池在预热，属于正常；后者才是真泄漏。再配合按业务对象打点计数，比盯着总量更快找到源头。"
      ], {
        diagramSteps: [
          "函数里 `char* p = new char[1024];`，此时堆上这 1024 字节被 p 指着。",
          "中间一句 `if (err) return;` 提前返回，或者某个调用抛了异常。",
          "p 是栈上的局部变量，函数一退出它就没了 —— 但堆上那 1024 字节还在。",
          "现在没有任何指针指向这块内存了：既不可达，也没被释放，这就是泄漏。",
          "每来一个请求走一次这条错误路径，堆上就多留 1024 字节，进程 RSS 稳步上涨。",
          "跑 ASan 或 valgrind，它会记录每次分配的调用栈，退出时把没配对释放的那些连栈一起打出来。",
          "改成 `auto p = std::make_unique<char[]>(1024);`，无论从哪条路径退出，析构都会执行 —— 这类泄漏在写法层面就被消灭了。"
        ],
        pitfalls: [
          "只在正常路径写了 delete，忘了提前 return 和异常这两条路。这是裸指针泄漏的绝对主力。",
          "把「内存一直涨」直接判定成泄漏：内存池、分配器缓存（free 后不还给 OS）、glibc 的 arena 都会让 RSS 涨上去不下来，这属于正常行为。",
          "只盯 RSS 不看趋势形状：阶梯后平台是预热，持续线性才是泄漏。",
          "忘了非内存资源：fd 泄漏会撞上 `ulimit -n` 直接 accept 失败，线程泄漏会耗尽栈空间，这些比内存泄漏更快出事。",
          "用 valgrind 压测：它会让程序慢 10~50 倍，得到的性能数据没有参考价值，也可能因为超时掩盖真实问题。ASan 慢 2 倍左右，更适合常态化跑。",
          "看到 valgrind 报 `still reachable` 就慌：那通常是单例、全局对象、静态缓存，进程退出时本来就不打算释放，不是真泄漏。要重点看 `definitely lost`。"
        ],
        cppCode: [
          "// ✗ 三条路径，两条会漏",
          "void bad(int n) {",
          "    char* p = new char[n];",
          "    if (n < 0) return;         // 漏",
          "    mayThrow();                // 抛了也漏",
          "    delete[] p;                // 只有一路顺利才走到这",
          "}",
          "",
          "// ✓ 从写法上消灭这类泄漏",
          "void good(int n) {",
          "    auto p = std::make_unique<char[]>(n);",
          "    if (n < 0) return;         // 析构照常执行",
          "    mayThrow();                // 栈展开时也照常执行",
          "}",
          "",
          "// ✗ 工具查不出来的「逻辑泄漏」：只插不删",
          "std::map<OrderId, Order> g_cache;   // 永远不清理 → 一路涨",
          "",
          "// 排查命令：",
          "//   g++ -fsanitize=address -g a.cpp && ./a.out",
          "//   valgrind --leak-check=full --show-leak-kinds=all ./a.out",
          "//   cat /proc/<pid>/status | grep VmRSS",
          "",
          "// valgrind 的四类结果，只有前两类要紧：",
          "//   definitely lost —— 真泄漏，必须修",
          "//   indirectly lost —— 被上面那块带着一起漏的",
          "//   possibly lost   —— 指针偏移了，多半也要看",
          "//   still reachable —— 全局/单例，通常不用管"
        ].join("\n"),
        complexity: [
          "面试一句话：不可达且未释放才叫泄漏；但只增不减的缓存工具查不出来，危害一样，判断标准是稳定流量下内存能否收敛。",
          "能分清 valgrind 的 `definitely lost` 和 `still reachable`，说明你真跑过工具而不只是知道命令。",
          "主动提「fd 和线程泄漏往往比内存泄漏更早出事」，能体现服务端经验。"
        ]
      }),
      q("memory-dangling", "basic", true, "什么是野指针和悬空指针？", ["悬空指针", "野指针", "迭代器失效", "生命周期"], [
        "野指针（wild pointer）是「从来没被正确初始化过」的指针，里面是栈上残留的随机值，指向哪儿完全不可控。悬空指针（dangling pointer）是「曾经有效、但目标已经被释放」的指针 —— 地址是真的，内容已经不属于你了。",
        "比喻：野指针是随手写了一串数字的门牌号，谁也不知道能开出什么；悬空指针是一把旧房子的钥匙 —— 房子已经被拆了重盖，你拿着钥匙去开，开出来的是别人的家。",
        "悬空指针最危险的地方在于它「看起来还能用」：刚 free 的内存内容往往一时没被覆盖，读出来还是老数据，测试环境一切正常；等到线上并发一高，那块内存被别的对象占了，就开始出各种莫名其妙的数据错乱。",
        "常见来源有四个：返回局部变量的地址；对象已 delete 但指针还在别处被引用；容器扩容或删除元素导致迭代器、引用、指针失效；`string`／`vector` 的临时对象销毁后还在用它的 `c_str()`／`data()`。",
        "`p = nullptr` 只是止损，不是解决方案 —— 它能让「用了之后立刻崩」代替「悄悄读到脏数据」，便于定位，但同一块内存的其它副本指针你根本置不到。真正的解法是让所有权和生命周期在设计上就清晰。",
        "工程上的根治手段：能用栈对象就不用堆；必须用堆就交给 `unique_ptr`／`shared_ptr` 表达所有权；只观察不拥有的地方用 `weak_ptr`；跨线程传递对象生命周期时，宁可拷贝或用 shared_ptr，也不要传裸指针。"
      ], {
        diagramSteps: [
          "`int* p;` —— 没初始化，p 里是栈上的残留值，这就是野指针，`*p` 会写到某个随机地址。",
          "`int* q = new int(42);` —— q 有效，指向堆上一块 4 字节。",
          "`delete q;` —— 内存归还给分配器，但 q 这个变量里的地址值一个字节都没变。",
          "此刻 q 就是悬空指针：`*q` 可能还读到 42（内存还没被复用），也可能读到别的对象的数据。",
          "分配器把这块内存分给了另一个 `new`，现在两个对象共用同一块地址 —— 通过 q 写一下，另一个对象的成员就被改了。",
          "`delete q; q = nullptr;` 之后再 `*q` 会立刻段错误 —— 崩得早反而是好事，比静默错乱好查一百倍。",
          "但如果同一个地址还有 `q2`、`q3` 存在别处，置空 q 完全帮不到它们；这才是要靠所有权设计解决的部分。"
        ],
        pitfalls: [
          "返回局部变量的地址或引用：`int* f() { int x = 1; return &x; }`，函数一返回栈帧就作废。返回局部 `string` 的 `c_str()` 是同一个错误的变种。",
          "容器操作后继续用旧的迭代器／指针／引用：`vector` 一旦扩容，所有元素都搬了家，之前取的 `&v[0]` 全部悬空。`push_back` 之后必须假定全失效。",
          "对临时对象取内部指针：`const char* p = getString().c_str();` —— 那个临时 `string` 在这一行结束就析构了，p 当场悬空。",
          "以为 `delete` 会把指针置空 —— 不会，`delete` 只管内存，指针变量的值原封不动。",
          "只给自己手里那一个指针置空就安心了，忘了同一地址可能还有好几份副本散在别处。",
          "多线程里 A 线程释放对象、B 线程还在用：这是最难复现的一类悬空，必须靠 `shared_ptr` 或明确的生命周期协议来解决。"
        ],
        cppCode: [
          "// ① 野指针：从没初始化",
          "int* wild;          // 里面是栈上的随机值",
          "// *wild = 1;       // 写到哪儿谁也不知道",
          "int* ok = nullptr;  // 至少可判、可崩得明确",
          "",
          "// ② 悬空指针：目标已释放",
          "int* q = new int(42);",
          "delete q;           // 内存还了，但 q 的值没变",
          "// *q               // 可能还读到 42，也可能读到别人的数据",
          "q = nullptr;        // 止损：之后再用会立刻崩",
          "",
          "// ③ 返回局部变量地址",
          "// int* bad() { int x = 1; return &x; }   // 栈帧已作废",
          "",
          "// ④ 容器扩容 → 所有指针/引用/迭代器全失效",
          "std::vector<int> v{1, 2, 3};",
          "int* first = &v[0];",
          "v.push_back(4);     // 可能重新分配并搬家",
          "// *first           // 悬空",
          "",
          "// ⑤ 临时对象的内部指针",
          "// const char* s = makeString().c_str();",
          "// 临时 string 在这一行结束就没了，s 当场悬空",
          "std::string keep = makeString();   // 先留住",
          "const char* s = keep.c_str();      // 这样才安全",
          "",
          "// 根治：让所有权自己说话",
          "auto owner = std::make_unique<Conn>();",
          "std::weak_ptr<Conn> observer;   // 只看不拥有，用前先 lock()"
        ].join("\n"),
        complexity: [
          "面试一句话：野指针是没初始化过，悬空指针是目标已释放；后者更危险，因为它常常「看起来还能用」。",
          "主动指出「置 nullptr 只是止损，同一地址的其它副本置不到」，比只答「记得置空」清醒得多。",
          "能把容器扩容导致的迭代器失效也归到悬空这一类，说明你是按本质而不是按名词在理解。"
        ]
      }),
      q("memory-alignment", "intermediate", true, "什么是内存对齐？为什么结构体会有 padding？", ["对齐", "padding", "alignas", "cache line"], [
        "内存对齐指的是：某个类型的对象，其起始地址必须是它对齐要求的整数倍。一般规则是「自然对齐」—— `int`（4 字节）要放在 4 的倍数地址上，`double`（8 字节）要放在 8 的倍数上。",
        "比喻：停车场如果不画线，每辆车随便停，最后总面积够但没一辆能顺利开进开出。画了线（对齐）会浪费一些边角，换来的是每次停取都是一步到位。",
        "为什么硬件在意：CPU 是按固定宽度的块从内存取数据的。一个 4 字节的 int 如果跨在两个块中间，就得取两次再拼起来；在 x86 上这只是慢，在一些 ARM／MIPS 上直接是总线错误。原子操作更严格 —— 跨缓存行的原子变量可能完全丧失原子性保证。",
        "padding 就是编译器为了让每个成员都落在合法地址上、在成员之间插入的空字节。此外结构体「整体大小」必须是其最大成员对齐要求的整数倍，所以末尾也常有一段补白 —— 这是为了保证数组里第 n 个元素的每个成员依然对齐。",
        "由此得出一条免费的优化：把成员「按大小从大到小声明」，往往能显著缩小结构体。同样三个成员，顺序换一下可能从 24 字节降到 16 字节 —— 内存少了三分之一，一条 cache line 能多装一个对象，热路径上是实打实的收益。",
        "控制手段各有代价：`alignas(64)` 用来「加大」对齐，典型场景是让多线程各自写的变量独占一条 cache line 以消除伪共享；`#pragma pack(1)` 用来「取消」填充，只在解析网络协议、读二进制文件这类必须按字节精确布局的地方用 —— 它会带来非对齐访问，慢，而且在某些平台上直接崩。"
      ], {
        diagramSteps: [
          "看 `struct A { char c; int i; char d; };`：先放 c，占地址 0。",
          "接着要放 int i，它必须落在 4 的倍数上 —— 地址 1 不行，于是编译器插入 3 字节 padding，i 放在地址 4~7。",
          "再放 d，占地址 8。此刻已用 9 字节。",
          "但结构体整体大小必须是最大成员对齐（这里是 4）的倍数，于是末尾再补 3 字节 → `sizeof(A) == 12`。",
          "末尾这段补白不是浪费：它保证 `A arr[2]` 里 arr[1].i 依然落在 4 的倍数上。",
          "现在把顺序换成 `struct B { int i; char c; char d; };`：i 占 0~3，c 占 4，d 占 5，末尾补 2 → `sizeof(B) == 8`。",
          "同样三个成员，只是换了声明顺序，就从 12 字节降到 8 字节 —— 少了三分之一，而且一条 64 字节的 cache line 从装 5 个变成装 8 个。"
        ],
        pitfalls: [
          "以为 `sizeof(struct)` 等于各成员之和 —— 因为 padding 的存在几乎总是更大。",
          "直接把结构体 `memcpy` 进网络发出去：padding 里是未初始化的垃圾字节，且不同编译器／平台的布局可能不同，对端解析出错。协议结构要么显式 pack，要么逐字段序列化。",
          "用 `memcmp` 比较两个结构体是否相等：padding 字节参与比较，两个逻辑上相同的对象可能返回不等。要逐字段比或用 `operator==`。",
          "滥用 `#pragma pack(1)`：换来的非对齐访问在 x86 上慢，在部分 ARM 上直接总线错误，而且原子操作可能失效。只在真正需要字节精确布局的地方用。",
          "对 `alignas(64)` 的成员用 `new` 分配：C++17 之前 `operator new` 不保证过对齐（over-aligned）类型的对齐，可能拿到没对齐的地址。C++17 起才有对齐版本的 `operator new`。",
          "为了省内存把成员顺序调乱，牺牲了可读性 —— 通常按大小分组即可，不必逐字节抠。"
        ],
        cppCode: [
          "#include <cstddef>",
          "",
          "// 顺序不好：12 字节",
          "struct A {",
          "    char c;      // 0",
          "                 // 1~3 padding",
          "    int  i;      // 4~7",
          "    char d;      // 8",
          "                 // 9~11 尾部 padding（整体凑成 4 的倍数）",
          "};",
          "static_assert(sizeof(A) == 12);",
          "",
          "// 从大到小排：8 字节，白捡三分之一",
          "struct B {",
          "    int  i;      // 0~3",
          "    char c;      // 4",
          "    char d;      // 5",
          "                 // 6~7 尾部 padding",
          "};",
          "static_assert(sizeof(B) == 8);",
          "",
          "// 查看每个成员的实际偏移",
          "// offsetof(A, i) == 4，offsetof(B, c) == 4",
          "// alignof(int) == 4，alignof(double) == 8",
          "",
          "// 加大对齐：让两个线程各写各的 cache line，消除伪共享",
          "struct alignas(64) Counter { std::atomic<long> n{0}; };",
          "Counter a, b;   // a 和 b 一定不在同一条 cache line 上",
          "",
          "// 取消填充：只用于协议/二进制格式，代价是非对齐访问",
          "#pragma pack(push, 1)",
          "struct WireHeader {",
          "    uint8_t  type;    // 偏移 0",
          "    uint32_t len;     // 偏移 1（没有 padding！）",
          "};",
          "#pragma pack(pop)",
          "static_assert(sizeof(WireHeader) == 5);"
        ].join("\n"),
        complexity: [
          "面试一句话：对齐是硬件要求，padding 是编译器为满足它而插入的空隙；结构体整体大小还要凑成最大成员对齐的倍数。",
          "主动给出「成员按从大到小声明能白捡内存」这个可操作结论，并算一遍 12 → 8 的例子，比只解释概念有用得多。",
          "能把 `alignas(64)` 和伪共享、`#pragma pack` 和协议解析各自对应上，说明你知道这两个方向的用途是相反的。"
        ]
      }),
      q("memory-delete-array", "intermediate", false, "delete 和 delete[] 为什么不能混用？", ["delete[]", "cookie", "析构次数"], [
        "核心差别只有一个：`delete` 认定这块内存上只有一个对象，`delete[]` 需要知道这里有<n>个对象，好把析构函数调 n 次。而「n 是多少」这个信息，编译器必须找地方存。",
        "常见实现是在 `new[]` 返回的地址「前面」偷偷多分配一小块，写上元素个数（俗称 cookie），返回给你的指针是往后偏移过的。`delete[]` 会先往前退回去读出 n，再倒序析构 n 个对象，最后按「那个退回后的地址」释放。",
        "所以 `new[]` 配 `delete` 会连错两处：一是只析构第 0 个元素，后面 n-1 个对象的析构函数根本不跑（它们持有的内存、fd、锁全泄漏）；二是把偏移过的地址交给了 free，而分配器记录的起始地址在它前面 —— 堆的元数据当场被破坏。",
        "反过来 `new` 配 `delete[]`：会去读根本不存在的 cookie，拿到一个垃圾数字当元素个数，然后照着这个数字疯狂调析构函数。后果通常是立刻崩，但也可能安静地踩坏一大片内存。",
        "有个容易误导人的现象：对 `int`、`char` 这种平凡类型，很多实现不生成 cookie（没有析构函数要调），于是 `new int[10]` 配 `delete` 看起来「也能跑」。这是纯粹的运气 —— 标准上它就是未定义行为，换个编译器或加个成员就会炸。",
        "工程结论很干脆：几乎没有理由再手写 `new[]`。要动态数组就用 `std::vector`，要字符串就用 `std::string`，实在要裸数组也用 `std::make_unique<T[]>(n)` —— 它记得配对的是 `delete[]`。"
      ], {
        diagramSteps: [
          "写 `Foo* p = new Foo[3];`，分配器实际要了 `sizeof(Foo)*3 + cookie` 这么多。",
          "内存布局是：[cookie=3][Foo0][Foo1][Foo2]，而返回给你的 p 指向 Foo0，已经跳过了 cookie。",
          "`delete[] p;` 的动作：先从 p 往前退到 cookie 读出 3，倒序调用 ~Foo() 三次，最后拿「p 减去 cookie 大小」这个真实起始地址去释放。",
          "如果写成 `delete p;`：只在 p 上调一次 ~Foo()，Foo1 和 Foo2 的析构函数完全没跑。",
          "接着它把 p 本身（而不是真实起始地址）交给分配器释放 —— 分配器在这个地址上找不到自己的元数据，堆结构被破坏。",
          "破坏往往不当场发作：可能几百次分配之后，在一个毫不相干的 malloc 里崩掉，栈回溯指向完全无辜的代码。",
          "反向的 `new` 配 `delete[]` 更直接：读到的「元素个数」是随机内存，照着它循环调析构，通常立刻段错误。"
        ],
        pitfalls: [
          "`new[]` 配 `delete`：后 n-1 个对象不析构（资源泄漏）+ 释放地址错位（堆损坏），两个问题同时发生。",
          "用 `int`、`double` 数组测试后得出「混用也没事」的结论 —— 平凡类型往往没有 cookie，那只是恰好没崩。",
          "`std::unique_ptr<T> p(new T[n]);` 写错了模板参数：它析构时调的是 `delete` 而不是 `delete[]`。必须写 `std::unique_ptr<T[]>`。",
          "`shared_ptr` 管数组时忘了给删除器：C++17 之前必须写 `shared_ptr<T>(new T[n], [](T* p){ delete[] p; })`，C++17 起才支持 `shared_ptr<T[]>`。",
          "在基类指针上 `delete[]` 派生类数组：即使有虚析构也是未定义行为，因为数组下标是按基类大小算的，步长根本不对。",
          "`malloc` 出来的内存用 `delete`、或 `new` 出来的用 `free` —— 同一类错误的另外两种组合，后果一样。"
        ],
        cppCode: [
          "struct Foo { std::string s; ~Foo() { /* 要释放东西 */ } };",
          "",
          "// new[] 的实际布局（典型实现）：",
          "//   [cookie=3][Foo0][Foo1][Foo2]",
          "//              ↑ 返回给你的指针指这里",
          "Foo* p = new Foo[3];",
          "",
          "delete[] p;   // ✓ 退回读 cookie → 析构 3 次 → 按真实地址释放",
          "// delete p;  // ✗ 只析构 Foo0，且用错位的地址去 free",
          "",
          "Foo* q = new Foo;",
          "delete q;     // ✓",
          "// delete[] q;  // ✗ 读到垃圾 cookie，照着它疯狂析构",
          "",
          "// 平凡类型「看起来没事」，但依然是未定义行为",
          "int* a = new int[10];",
          "// delete a;    // 多数实现不崩 —— 纯属运气，别依赖",
          "delete[] a;      // ✓",
          "",
          "// unique_ptr 也要选对特化",
          "std::unique_ptr<Foo>   bad(new Foo[3]);   // ✗ 析构时用 delete",
          "std::unique_ptr<Foo[]> good(new Foo[3]);  // ✓ 用 delete[]",
          "auto best = std::make_unique<Foo[]>(3);   // ✓ 更好",
          "",
          "// 最好的答案：根本别写 new[]",
          "std::vector<Foo> v(3);"
        ].join("\n"),
        complexity: [
          "面试一句话：`delete[]` 要靠 cookie 知道元素个数，才能析构 n 次并按真实起始地址释放；混用会同时导致漏析构和堆损坏。",
          "主动说明「平凡类型往往不生成 cookie，所以测试时可能不崩，但仍是未定义行为」，能说明你理解的是机制而不是规则。",
          "落到「用 vector 或 make_unique<T[]>，别手写 new[]」，才是这题想听的工程结论。"
        ]
      }),
      q("memory-custom-allocator", "advanced", false, "什么时候会考虑对象池或自定义分配器？", ["对象池", "allocator", "pmr", "内存碎片"], [
        "先说前提：默认的 `new`／`malloc` 已经很快了（tcmalloc、jemalloc 有线程本地缓存，常见路径几十纳秒）。所以答这题的第一句应该是「先 profile 确认分配真的是瓶颈」，而不是直接讲怎么写池子。",
        "真正值得上对象池的场景有四个特征，最好凑齐几条再动手：对象「大小固定」、「创建销毁极其频繁」、「生命周期短且集中」、「对延迟抖动敏感」。交易系统里的订单、行情快照、网络包缓冲区，通常四条全中。",
        "比喻：默认分配器像每次买东西都去银行取一次钱 —— 单次不慢，但一天跑几万趟就受不了。对象池是提前在抽屉里备了一箱零钱，用的时候直接拿，用完扔回抽屉，全程不出门。",
        "对象池带来的好处有三层，延迟只是其中之一：一是「省掉分配器的加锁和查找」；二是「消除内存碎片」，因为块大小统一、地址连续；三是「提升缓存命中率」，池化对象在内存上挨着，遍历时预取器能起作用 —— 第三条在实测里往往比第一条收益更大。",
        "代价必须一起说出来，否则显得没落地过：容量要预估（用满了是扩容还是拒绝？）、内存不还给操作系统（RSS 只涨不落）、调试工具变瞎（ASan／valgrind 看不见池内的越界和 use-after-free）、以及多线程下池本身可能成为新的争用点（通常要做成 thread-local）。",
        "C++17 之后有个折中选择值得提：`std::pmr`（多态分配器）。用 `pmr::monotonic_buffer_resource` 配一块栈上缓冲，就能让 `pmr::vector` 完全不碰堆；`unsynchronized_pool_resource` 则是现成的池。既拿到大部分收益，又不用自己维护一套分配器。"
      ], {
        diagramSteps: [
          "先 profile：用 perf 看 `malloc`／`free` 及其下层的 `_int_malloc` 占了多少 CPU，或者看延迟分位数里的长尾来自哪。",
          "确认瓶颈后估算规模：对象多大、峰值同时存活多少个、创建销毁频率是多少。",
          "启动时一次性向系统要一大块连续内存，按对象大小切成等大的槽位。",
          "把所有空闲槽用一个侵入式链表串起来 —— 直接借用槽位本身的前 8 字节存 next 指针，不额外占空间。",
          "分配：从链表头摘一个槽，O(1)，无锁（thread-local 时）或一次 CAS。再用 placement new 在槽上原地构造对象。",
          "释放：显式调 `~T()`，然后把槽挂回链表头，O(1) —— 内存从头到尾没有还给操作系统。",
          "关键收益不只是快：所有对象地址连续，遍历订单表时硬件预取器能连续命中，cache miss 大幅下降。",
          "最后补一层安全网：容量用尽时的策略（回退到 new？拒绝？扩容一整块？）必须明确，否则线上高峰会以最难查的方式失败。"
        ],
        pitfalls: [
          "没有 profile 就上池子：把简单代码变复杂，换来一个测不出来的收益，还引入了新的 bug 面。",
          "只算「省了多少纳秒分配时间」，忘了统计缓存命中率的变化 —— 后者往往才是大头，不测就说不清收益到底从哪来。",
          "池内内存越界或 use-after-free，ASan 和 valgrind 完全看不见（内存一直是「已分配」状态），一个本来 5 分钟能定位的问题变成两天。上池子前最好留一个可以切回默认分配器的开关。",
          "忘了显式调析构函数：从池里拿对象用的是 placement new，还回去时必须手动 `p->~T()`，否则对象持有的其它资源全漏。",
          "多线程共用一个池却只加一把大锁：争用比原来的 malloc 还严重。要么 thread-local，要么分片。",
          "忽略对齐：池的槽位起始地址必须满足 `alignof(T)`，装 `alignas(64)` 的对象时尤其容易出错。",
          "以为池化后内存占用会下降 —— 恰恰相反，池是按峰值预留的，RSS 通常比原来更高且不回落。"
        ],
        cppCode: [
          "// ① 先量，再动手",
          "//   perf record -g ./app && perf report",
          "//   看 malloc / _int_malloc / free 的占比和长尾来源",
          "",
          "// ② 定长对象池的核心：空闲链表借用槽位本身存指针",
          "template <class T, size_t N>",
          "class Pool {",
          "public:",
          "    Pool() {",
          "        for (size_t i = 0; i + 1 < N; ++i)",
          "            slot(i)->next = slot(i + 1);",
          "        slot(N - 1)->next = nullptr;",
          "        free_ = slot(0);",
          "    }",
          "",
          "    template <class... A>",
          "    T* acquire(A&&... a) {",
          "        if (!free_) return nullptr;        // 容量策略要想清楚",
          "        Slot* s = free_;",
          "        free_ = s->next;",
          "        return new (s) T(std::forward<A>(a)...);   // 原地构造",
          "    }",
          "",
          "    void release(T* p) {",
          "        p->~T();                           // 必须手动析构",
          "        Slot* s = reinterpret_cast<Slot*>(p);",
          "        s->next = free_;",
          "        free_ = s;",
          "    }",
          "",
          "private:",
          "    union Slot { Slot* next; alignas(T) char buf[sizeof(T)]; };",
          "    Slot* slot(size_t i) { return &storage_[i]; }",
          "",
          "    Slot  storage_[N];",
          "    Slot* free_ = nullptr;",
          "};",
          "",
          "// ③ 不想自己写就用 pmr：栈上缓冲，全程不碰堆",
          "#include <memory_resource>",
          "",
          "char buf[64 * 1024];",
          "std::pmr::monotonic_buffer_resource res{buf, sizeof(buf)};",
          "std::pmr::vector<Order> orders{&res};   // 分配全在 buf 里"
        ].join("\n"),
        complexity: [
          "面试一句话：只有在「定长 + 高频 + 短生命周期 + 对抖动敏感」都成立、且 profile 证实分配是瓶颈时才上池子。",
          "把收益说成三层（省分配开销、消碎片、提升缓存命中率）并点明第三层往往最大，比只说「快」专业得多。",
          "主动讲代价 —— 尤其是「ASan 看不见池内越界」和「RSS 只涨不落」，最能体现真上过生产。",
          "提一句 `std::pmr` 作为不用造轮子的折中方案，是个不错的收尾。"
        ]
      }),
      q("memory-shared-threadsafe", "advanced", false, "shared_ptr 的引用计数线程安全吗？对象本身线程安全吗？", ["shared_ptr", "线程安全", "原子操作", "控制块"], [
        "标准答案要分成三个层次，混在一起讲就说不清了：「控制块的引用计数」是线程安全的；「被指向的对象」不是；<shared_ptr 实例本身>也不是。",
        "第一层：引用计数用原子操作维护，所以多个线程同时拷贝、销毁「各自的」 shared_ptr 副本（哪怕它们指向同一对象）是安全的，不会数错、不会重复释放。这是标准明确保证的。",
        "第二层：被指向的对象完全不受保护。两个线程通过各自的 shared_ptr 同时改同一个对象的成员，就是普通的数据竞争，该加锁还得加锁。`shared_ptr` 解决的是「什么时候释放」，不是「怎么并发访问」。",
        "第三层最容易被忽略：「同一个 shared_ptr 变量」被多个线程同时读写（一个在 `reset()`，另一个在拷贝它）是数据竞争。因为一次赋值要同时改两个指针（对象指针和控制块指针），不是原子的。要并发改同一个 shared_ptr 变量，得用 `std::atomic<std::shared_ptr<T>>`（C++20）或旧的 `std::atomic_load/store` 自由函数。",
        "比喻：门口的计数牌是电子的、防并发的（第一层），但屋里的家具没人看着，两个人同时搬会撞（第二层）；而且「你手里那张写着地址的卡片」本身也不是原子的，别人正改这张卡时你去读，会读到一半新一半旧（第三层）。",
        "还有一个性能层面的追问点：原子的引用计数不是免费的。高频拷贝 shared_ptr 会在多核间反复争抢控制块所在的那条 cache line，实测能明显拖慢热路径。所以函数参数应当优先传 `const T&` 或 `const shared_ptr<T>&`，只在真正需要延长生命周期时才按值拷贝。"
      ], {
        diagramSteps: [
          "线程 A 和 B 各自持有一个 shared_ptr 副本 sa、sb，指向同一个对象和同一个控制块。",
          "A 拷贝 sa 生成 sa2：控制块里的强计数做一次原子 +1 —— 安全。",
          "同时 B 销毁 sb：强计数原子 -1 —— 同样安全，两个操作不会互相干扰，计数不会错。",
          "但如果 A 和 B 同时执行 `obj->field = x;` —— 这跟 shared_ptr 无关，就是裸的数据竞争，需要锁或原子成员。",
          "再看第三层：A 执行 `g_sp.reset(new T)`，B 同时执行 `auto local = g_sp;`。",
          "赋值要更新两个成员（对象指针 + 控制块指针），B 可能读到「新的对象指针配旧的控制块」这种撕裂状态。",
          "结果可能是对错误的控制块加计数，进而重复释放或永不释放 —— 必须用 `atomic<shared_ptr<T>>` 或加锁。",
          "性能视角：每次拷贝都要原子改控制块，多核高频拷贝时那条 cache line 在核间反复弹跳，这才是 shared_ptr 真正的隐性成本。"
        ],
        pitfalls: [
          "把「shared_ptr 线程安全」当成「对象也线程安全」—— 这是最常见的误解，安全的只有那个计数器。",
          "多线程共享「同一个」 shared_ptr 变量并各自读写它，以为原子计数已经保证了一切。控制块安全不等于指针变量本身安全。",
          "用 `if (sp) sp->f();` 这种「先判空再用」的写法访问一个可能被别的线程 reset 的共享 shared_ptr —— 判断和使用之间存在窗口。",
          "在热路径上按值传 shared_ptr：每次调用一次原子加、一次原子减，加上 cache line 争用，开销远超想象。传 `const&` 就够了。",
          "`weak_ptr::lock()` 是原子安全的，但很多人反过来先写 `if (!w.expired()) w.lock()->f();` —— 两步之间有窗口，应该一步 `if (auto s = w.lock())`。",
          "以为 `make_shared` 能顺带解决线程安全 —— 它只优化分配次数，跟并发一点关系没有。"
        ],
        cppCode: [
          "#include <memory>",
          "#include <atomic>",
          "#include <mutex>",
          "",
          "auto sp = std::make_shared<Data>();",
          "",
          "// ① 引用计数：安全。各线程操作自己的副本",
          "std::thread t1([sp] { /* 拷贝进来时原子 +1 */ });",
          "std::thread t2([sp] { /* 析构时原子 -1 */ });",
          "",
          "// ② 对象内容：不安全，要自己同步",
          "std::mutex m;",
          "void writer(std::shared_ptr<Data> p) {",
          "    std::lock_guard<std::mutex> lk(m);",
          "    p->field = 42;          // 没有锁就是数据竞争",
          "}",
          "",
          "// ③ 同一个 shared_ptr 变量被并发读写：不安全",
          "std::shared_ptr<Data> g_sp;",
          "// 线程 A: g_sp.reset(new Data);",
          "// 线程 B: auto local = g_sp;      // ✗ 可能读到撕裂状态",
          "",
          "// C++20 的写法",
          "std::atomic<std::shared_ptr<Data>> g_atomic;",
          "g_atomic.store(std::make_shared<Data>());",
          "auto snap = g_atomic.load();       // ✓ 安全",
          "",
          "// C++11~17 的写法",
          "// auto snap = std::atomic_load(&g_sp);",
          "// std::atomic_store(&g_sp, np);",
          "",
          "// ④ 性能：热路径别按值传",
          "void hot(const std::shared_ptr<Data>& p);  // ✓ 不动计数",
          "void slow(std::shared_ptr<Data> p);        // ✗ 一加一减"
        ].join("\n"),
        complexity: [
          "面试一句话：控制块的引用计数是原子的、安全；被指向的对象不安全；同一个 shared_ptr 变量被并发读写同样不安全。三层要分开答。",
          "能主动讲出第三层（shared_ptr 变量本身的读写竞态）并说出 `atomic<shared_ptr>` 的解法，是这题真正的区分点。",
          "补一句「热路径传 const& 而不是按值，避免原子计数和 cache line 争用」，能把线程安全和性能两条线连起来。"
        ]
      })
    ],
    STL: [
      q("stl-vector-list-deque", "basic", true, "vector、list、deque 的底层结构和适用场景是什么？", ["vector", "list", "deque"], [
        "vector 连续内存、缓存友好，随机访问快，是默认首选容器。",
        "list 是链表，插入删除某些位置方便，但局部性差、额外指针开销大。",
        "deque 适合头尾都频繁操作的场景，但内存布局比 vector 更复杂。",
        "真实工程里如果没有非常明确的需求，优先选择 vector 往往是最稳妥的默认策略。"
      ]),
      q("stl-map-vs-unordered-map", "basic", true, "map 和 unordered_map 的区别是什么？", ["map", "unordered_map"], [
        "map 通常基于红黑树，键有序，查找复杂度稳定在 `O(log n)`。",
        "unordered_map 基于哈希表，平均查找更快，但最坏情况和哈希质量相关。",
        "如果需要有序遍历、范围查询或稳定复杂度，map 更合适。",
        "另外还要知道 unordered_map 在 rehash 时可能让迭代器失效，这也是工程上常见坑点。"
      ]),
      q("stl-set-vs-unordered-set", "basic", true, "set 和 unordered_set 的区别是什么？", ["set", "unordered_set"], [
        "核心差异和 map / unordered_map 类似，只是元素本身就是键。",
        "set 适合有序去重和区间相关操作，unordered_set 更偏重快速存在性判断。",
        "选型时要把迭代顺序、内存开销和哈希质量一起考虑。",
        "如果只会背“unordered 更快”是不够的，面试官更想听到你对场景和约束的判断。"
      ]),
      q("stl-reserve-vs-resize", "basic", true, "vector 的 reserve 和 resize 有什么区别？", ["reserve", "resize"], [
        "reserve 只调整容量 capacity，不改变逻辑元素个数 size。",
        "resize 会直接改变 size，必要时构造新元素或销毁多余元素。",
        "想减少扩容次数用 reserve，想真正创建指定数量元素用 resize。",
        "也就是说 reserve 不会帮你生成可访问的新元素，而 resize 之后新增位置就是容器逻辑内容的一部分。"
      ]),
      q("stl-push-vs-emplace", "intermediate", true, "push_back 和 emplace_back 的区别是什么？", ["push_back", "emplace_back"], [
        "push_back 接收一个已经构造好的对象或可转成对象的值。",
        "emplace_back 在容器内原地构造，理论上可少一次临时对象构造。",
        "但不是所有场景都显著更快，代码可读性和参数歧义也要考虑。",
        "如果本来就已经有一个现成对象，push_back 往往已经足够清晰，不需要为了“看起来高级”强行换成 emplace_back。"
      ]),
      q("stl-iterator-invalid", "intermediate", true, "迭代器失效有哪些典型场景？", ["迭代器失效"], [
        "vector 扩容后原有迭代器、引用和指针通常会失效。",
        "erase 通常会让被删位置及其后的迭代器失效，具体规则取决于容器类型。",
        "面试时说清“容器不同，规则不同”，比死记一个表更重要。",
        "工程上处理这类问题时，一个常见习惯是优先使用 erase 返回的新迭代器继续遍历。"
      ]),
      q("stl-sort", "intermediate", true, "std::sort 一般是什么实现思路？现代 C++ 还需要手写排序算法吗？", ["sort", "introsort", "严格弱序", "nth_element"], [
        "先把结论摆出来：生产代码不需要手写排序，冒泡尤其可以说永远不需要 —— 它在任何数据分布下都不如插入排序。但「不用写」不等于「不用懂」，真正会出事的是调用契约，不是算法本身。",
        "std::sort 的典型实现是 introsort（内省排序），把三个算法拼在一起：主体用快速排序；递归深度超过 2·log₂n 就切成堆排序；子区间小到十几个元素就不再递归，最后统一做一遍插入排序收尾。",
        "为什么要拼：纯快排最坏 O(n²)，纯堆排常数大又不 cache 友好，纯插入排序是 O(n²)。三个各有短板，组合起来才既快又稳 —— 所以 C++11 起标准明确要求 std::sort 最坏也是 O(n log n)。",
        "第一条契约，也是最容易出事的一条：比较器必须是「严格」弱序，只能用 < 不能用 <=。写成 <= 的后果不是顺序错了，而是未定义行为 —— 分区的内层循环靠 pivot 当哨兵挡住扫描指针，而 <= 让相等元素也返回 true，指针会直接冲出数组读越界内存。",
        "第二条契约：std::sort 不稳定，key 相等的元素相对顺序会被打乱。所以「先排次要字段再排主要字段」这个技巧只对 stable_sort 成立，用 std::sort 这么做第二遍会把第一遍打乱，结果是错的。",
        "第三条，收益往往最大：只需要更少的时候别整体排序。只要第 k 个用 nth_element（平均 O(n)），只要前 k 个用 partial_sort（O(n log k)），只要分两堆用 partition（O(n)）—— 很多「排序太慢」其实是根本不需要排序。"
      ], {
        diagramSteps: [
          "第一步：std::sort 拿到整个区间，按快速排序选 pivot 做分区，然后对左右两半递归。",
          "第二步：每层递归都记着深度。一旦深度超过 2·log₂n，说明 pivot 选得太糟、快排正在往 O(n²) 退化。",
          "第三步：这时把当前子区间整体切换成堆排序 —— 堆排常数大一些，但最坏也是 O(n log n)，兜住了底。",
          "第四步：递归下去，子区间小到大约 16 个元素（实现相关）就直接返回，不再继续切分。",
          "第五步：此时整个数组已经「分块有序」—— 每个元素离最终位置都不远。最后对全区间跑一遍插入排序，近乎有序的输入让它接近 O(n)。",
          "关键理解：那些手写算法并没有消失，只是搬进了标准库、并且各自只负责它最擅长的那一段。",
          "反过来看比较器：分区的内层循环是 while (comp(*first, pivot)) ++first;，没有边界检查。comp 用 < 时 pivot 自己就是哨兵，comp 用 <= 时 comp(pivot, pivot) 为真，哨兵失效，指针走出数组。"
        ],
        pitfalls: [
          "比较器写成 <= 或 >=：这是 UB，不是「结果稍微不对」。典型症状是几万条数据才偶发一次段错误，崩溃点落在越界访存上，离真正的病根很远。调试期加 -D_GLIBCXX_DEBUG（libc++ 用 -D_LIBCPP_ENABLE_ASSERTIONS=1）能让标准库主动校验严格弱序。",
          "多字段排序时手写 if-else 链，很容易在某个分支上漏掉「相等时返回 false」。稳妥写法是 std::tie(a.x, a.y) < std::tie(b.x, b.y)，天然满足严格弱序。",
          "用 std::sort 做「多趟稳定排序」：第二趟会打乱第一趟的结果。要么全程 stable_sort，要么写一个把所有字段都比完的复合比较器。",
          "拿 std::sort 排 std::list：编译不过。std::sort 要求随机访问迭代器，list 只有双向迭代器，得用 list::sort 成员函数（内部归并，只改指针不搬元素）。",
          "已经找到第 k 大还继续全排：nth_element 平均 O(n)，比 O(n log n) 的全排省一个量级，TopK 场景差距很明显。",
          "比较器里有状态（捕获了会被修改的变量）或者对同一对元素两次返回不同结果：排序期间元素顺序不确定，这类比较器的行为也随之不确定。比较器应当是纯函数。"
        ],
        cppCode: [
          "// ✗ 未定义行为：相等时返回 true，违反严格弱序",
          "std::sort(v.begin(), v.end(),",
          "          [](const A& a, const A& b) { return a.key <= b.key; });",
          "",
          "// ✓ 相等时必须返回 false",
          "std::sort(v.begin(), v.end(),",
          "          [](const A& a, const A& b) { return a.key < b.key; });",
          "",
          "// 多字段：tuple 比较，不会写漏「相等返回 false」",
          "std::sort(v.begin(), v.end(), [](const A& a, const A& b) {",
          "    return std::tie(a.price, a.seq) < std::tie(b.price, b.seq);",
          "});",
          "",
          "// 降序写 >，不要写 >=",
          "std::sort(v.begin(), v.end(), std::greater<>{});",
          "",
          "// 只要第 k 个 / 只要前 k 个是哪些：平均 O(n)",
          "std::nth_element(v.begin(), v.begin() + k, v.end());",
          "",
          "// 要前 k 个且这 k 个内部有序：O(n log k)",
          "std::partial_sort(v.begin(), v.begin() + k, v.end());",
          "",
          "// 相等元素要保持原有顺序",
          "std::stable_sort(v.begin(), v.end());",
          "",
          "// C++17 一行开并行；C++20 省掉两个迭代器",
          "std::sort(std::execution::par, v.begin(), v.end());",
          "std::ranges::sort(v);"
        ].join("\n"),
        complexity: [
          "复杂度：std::sort 平均和最坏都是 O(n log n)，原地排序不需要额外内存；stable_sort 有足够额外内存时 O(n log n)，内存不够退化成 O(n log² n)。",
          "确实还需要手写的少数场景，每个都有明确理由：键是整数且值域已知时，基数/计数排序是 O(n)（比较排序的 O(n log n) 下界只对「只能两两比较」这个模型成立，能拿键当下标就绕过去了）；N 极小且固定时排序网络能编译成一串无分支的 min/max；数据大于内存时用外部排序。",
          "面试怎么答：先说生产代码不需要手写、冒泡永远不需要，再讲清 introsort 三段各补一块短板，然后主动把话题引到契约上 —— 严格弱序、不稳定、只要第 k 个就用 nth_element。这样答比手写一遍快排更能说明你在真实项目里排过序。"
        ]
      }),
      q("stl-priority-queue", "intermediate", false, "priority_queue 的底层通常是什么？", ["priority_queue", "heap"], [
        "priority_queue 通常基于堆结构实现，默认是大顶堆语义。",
        "它适合频繁取当前最大或最小元素，但不擅长任意位置删除。",
        "如果题目涉及 TopK、调度或合并有序流，这个容器很常见。",
        "如果继续追问实现细节，还可以补充它通常建立在 vector 之上，并通过比较器控制堆序。"
      ]),
      q("stl-remove-erase", "intermediate", true, "什么是 remove-erase idiom？", ["remove-erase"], [
        "标准算法 remove 不真正删除元素，而是把不保留元素移到逻辑尾部。",
        "真正收缩容器通常还要调用容器的 erase 把尾部删掉。",
        "很多面试官用它来考察你是否理解算法与容器职责边界。",
        "也就是说 remove 改的是元素排列，erase 改的才是容器大小，这两个动作不能混为一谈。"
      ]),
      q("stl-string-vector-view", "advanced", false, "什么时候使用 string_view 要特别注意生命周期？", ["string_view"], [
        "string_view 只是一段只读视图，不拥有底层字符内存。",
        "如果底层字符串是临时对象或很快被修改/释放，view 就会悬空。",
        "它适合只读解析和参数传递，但不能拿来延长数据生命周期。",
        "典型风险场景就是返回指向局部 string 的 string_view，或者把它跨线程长期保存。"
      ]),
      q("stl-algorithm-complexity", "intermediate", false, "为什么面试里不仅要会用 STL，还要理解复杂度和失效规则？", ["复杂度", "STL"], [
        "标准库只是工具，选错容器或误解复杂度会直接影响性能和正确性。",
        "很多线上 bug 不是不会写代码，而是容器语义理解偏差导致的。",
        "能讲出原理和权衡，才能体现真正的工程熟练度。",
        "真正有区分度的回答，往往不是“我会这个 API”，而是“我知道什么时候该用它、什么时候不该用它”。"
      ])
    ],
    "现代 C++": [
      q("modern-auto-nullptr", "basic", true, "auto 和 nullptr 分别解决了什么问题？", ["auto", "nullptr"], [
        "auto 减少复杂类型书写，让代码更聚焦语义。",
        "nullptr 提供真正的空指针字面量，避免 NULL 在重载解析里的歧义。",
        "面试里最好强调：简洁不等于滥用，公共接口依然要重视可读性。",
        "比如局部变量用 auto 往往很自然，但如果把类型信息完全藏掉影响理解，也不一定是好代码。"
      ]),
      q("modern-lambda-capture", "intermediate", true, "lambda 的捕获方式有哪些？最容易踩什么坑？", ["lambda", "capture"], [
        "常见有值捕获、引用捕获、显式捕获 this 和混合捕获。",
        "异步场景里最危险的是引用捕获，因为被引用对象可能已失效。",
        "回答时可结合线程池、回调和生命周期一起讲，显得更贴近实战。",
        "尤其是在异步回调里捕获 this，要非常明确对象是否还存活，否则很容易出现悬空访问。"
      ]),
      q("modern-move-semantics", "intermediate", true, "什么是移动语义？它为什么能提升性能？", ["移动语义", "move"], [
        "移动语义允许把资源所有权转移给新对象，而不是做昂贵的深拷贝。",
        "对字符串、容器和 buffer 这类资源型对象，移动通常只需交换内部指针等元数据。",
        "但被移动对象仍需保持可析构、可赋值的有效状态。",
        "另外也要知道 `std::move` 本身不移动，它只是把对象转换成可被移动的右值语义。"
      ]),
      q("modern-move-vs-forward", "advanced", true, "std::move 和 std::forward 的区别是什么？", ["std::move", "std::forward"], [
        "std::move 无条件把表达式转换成右值，用于显式表示资源可被移动。",
        "std::forward 主要用于模板里按原始值类别转发参数，实现完美转发。",
        "如果不在转发引用语境里，直接用 forward 往往没有意义。",
        "所以更简洁的记忆方式是：move 是“强制右值化”，forward 是“有条件地保持原始值类别”。"
      ]),
      q("modern-perfect-forwarding", "advanced", false, "什么是完美转发？它解决了什么问题？", ["完美转发"], [
        "完美转发让模板包装层尽量保留调用者传入参数的左值/右值属性。",
        "这样中间层不会无意增加拷贝，也不会破坏重载选择。",
        "它常用于工厂函数、emplace 家族和通用封装接口。",
        "这类题再往下通常会追问引用折叠规则，所以最好至少知道 `T&&` 在模板里不总是普通右值引用。"
      ]),
      q("modern-constexpr", "intermediate", true, "constexpr 和 const 的区别是什么？", ["constexpr", "const"], [
        "const 表示对象只读，不一定要求编译期求值。",
        "constexpr 更强调表达式或对象在编译阶段可计算。",
        "在数组长度、模板参数和高性能常量表达式场景下，constexpr 价值更明显。",
        "还可以补一句：constexpr 函数并不意味着每次都在编译期执行，它只是“允许在编译期求值”。"
      ]),
      q("modern-enum-class", "basic", false, "enum class 相比传统 enum 的好处是什么？", ["enum class"], [
        "enum class 有更强的作用域，不会把枚举项污染到外围命名空间。",
        "它默认不隐式转换成整数，类型安全更好。",
        "这类细节能体现你是否真正理解现代 C++ 的安全改进。",
        "代价是如果确实要转整数，往往需要显式 `static_cast`，这其实也是类型安全设计的一部分。"
      ]),
      q("modern-optional-variant", "advanced", false, "optional、variant、any 分别适合什么场景？", ["optional", "variant", "any"], [
        "optional 适合表达“可能没有值”的结果，但类型仍然固定。",
        "variant 适合已知有限种类型的联合，访问时需要做分支处理。",
        "any 最灵活但类型信息最弱，通常只有在通用容器或框架边界才谨慎使用。",
        "如果类型集合是已知的，优先用 variant 往往比 any 更安全，因为编译期就能约束可选类型范围。"
      ]),
      q("modern-range-for", "intermediate", false, "range-based for 看起来很简单，常见坑有哪些？", ["range for"], [
        "最常见是误用值拷贝，导致修改不生效或产生额外复制成本。",
        "另一个坑是遍历临时对象或在循环体里修改容器结构导致行为复杂。",
        "面试里说清 `auto`、`auto&`、`const auto&` 的选择依据很加分。",
        "很多性能问题就是因为把 `const auto&` 写成了 `auto`，无意中在循环里做了大量对象拷贝。"
      ]),
      q("modern-thread-mutex", "basic", true, "std::thread、mutex、lock_guard 的基本关系是什么？", ["std::thread", "mutex"], [
        "std::thread 用于创建执行线程，mutex 用于互斥访问共享资源。",
        "lock_guard 是 RAII 风格的上锁封装，离开作用域自动解锁。",
        "这个组合体现了现代 C++ 在并发接口上的风格：标准化 + RAII。",
        "实际代码里还要注意 thread 对象在析构前必须 join 或 detach，否则程序会直接 terminate。"
      ]),
      q("modern-string-view", "advanced", false, "什么时候 string_view 很适合，什么时候不适合？", ["string_view"], [
        "只读解析、参数传递和避免不必要拷贝时很适合。",
        "如果需要长期持有内容、跨线程异步使用或修改底层字符串，就要非常小心生命周期。",
        "它优化的是接口层的数据视图，不是万能的字符串替代品。",
        "一句话总结就是：string_view 适合“看”，不适合“拥有”，回答时把这点说清会很加分。"
      ])
    ],
    "高级 C++ 专题": [
      q("advanced-cpp-object-model", "advanced", true, "面试里如何解释 C++ 对象模型？", ["对象模型", "vptr", "vtable"], [
        "一个普通对象通常至少包含它自己的成员数据；如果类有虚函数，对象里一般还会有虚表指针，用于支持运行时多态。",
        "继承、虚继承和多重继承会让对象布局更复杂，因为对象里可能包含多个基类子对象以及额外的偏移信息。",
        "理解对象模型的意义不在于死背 ABI 细节，而在于能解释虚函数调用、对象大小、切片和基类指针转换为什么会这样工作。",
        "面试里更好的回答方式是“先讲抽象，再说明不同编译器实现细节可能不同”，这样既体现理解，也避免把实现细节说死。"
      ]),
      q("advanced-cpp-casts", "advanced", true, "static_cast、dynamic_cast、const_cast、reinterpret_cast 分别适合什么场景？", ["cast", "static_cast", "dynamic_cast"], [
        "static_cast 用于有明确语义的编译期转换，比如基本类型转换、向上转型或调用显式构造。",
        "dynamic_cast 主要用于多态类型体系中的安全向下转型，失败时指针会得到空指针，引用会抛异常。",
        "const_cast 只用于增加或去掉 const 或 volatile 限定，本身不改变对象真实是否可写；reinterpret_cast 则是最底层、最危险的按位解释转换。",
        "工程里应该优先选择语义最窄、最安全的转换方式，如果看到大量 reinterpret_cast，通常要警惕设计边界是否已经失控。"
      ]),
      q("advanced-cpp-exception-safety", "advanced", true, "什么是异常安全保证？基本保证、强保证、无抛保证分别是什么意思？", ["异常安全", "strong guarantee", "noexcept"], [
        "基本保证指即使抛异常，程序对象仍处于合法可析构状态，不会资源泄漏，但状态可能被部分修改。",
        "强保证强调操作要么完全成功，要么像没发生过一样回滚到原状态；无抛保证则是承诺这个操作本身不会抛出异常。",
        "这几个层次常用于容器、赋值操作和事务式修改逻辑中，能体现你是否真的理解接口契约和失败语义。",
        "如果继续追问，通常会落到 copy-and-swap、移动语义、noexcept 和资源回滚策略，这些都是异常安全设计的常见手段。"
      ]),
      q("advanced-cpp-noexcept", "advanced", true, "为什么移动构造和移动赋值经常建议声明为 noexcept？", ["noexcept", "移动构造"], [
        "很多标准库容器在扩容或重新安置元素时，会优先选择不会抛异常的移动操作，这样才能维持更强的异常安全保证。",
        "如果移动构造可能抛异常，容器有时会退回到拷贝策略，导致性能下降，甚至影响行为保证。",
        "所以对真正不会抛异常的移动操作，显式标记 noexcept 不只是语义更清晰，也会直接影响标准库选型。",
        "当然前提是你真的能保证它不抛；如果错误地加上 noexcept，一旦内部抛异常，程序会直接走 terminate。"
      ]),
      q("advanced-cpp-template-deduction", "advanced", true, "模板类型推导里，值传递、左值引用、万能引用的推导区别是什么？", ["模板推导", "万能引用", "引用折叠"], [
        "按值传递时，顶层 const 和引用属性通常会被忽略，所以推导出来的是更“裸”的类型。",
        "如果参数是 T&，那么左值实参会保留引用语义，推导出的 T 反映被引用对象的基础类型。",
        "如果参数是 T&& 且处于模板推导语境，它就可能成为转发引用：传左值时推成左值引用，传右值时推成普通类型。",
        "这类题真正想考的是你是否理解引用折叠和 perfect forwarding，而不是背一张规则表。"
      ]),
      q("advanced-cpp-sfinae-concepts", "advanced", false, "SFINAE 和 concepts 主要解决什么问题？", ["SFINAE", "concepts", "模板约束"], [
        "SFINAE 的核心思想是“替换失败不是错误”，让不满足条件的模板候选在重载解析阶段自动退出。",
        "它常用于模板约束、特性分发和编译期选择，但写法往往比较绕，出错信息也不友好。",
        "concepts 可以把模板约束写得更显式、更接近语义层面，让接口意图更清晰，错误信息也通常更好理解。",
        "面试里不一定要求你手写复杂元编程，但至少要知道 concepts 是在改善过去 SFINAE 可读性差的问题。"
      ]),
      q("advanced-cpp-abi", "advanced", false, "什么是 ABI？为什么 C++ 项目升级编译器或库版本时要关注它？", ["ABI", "二进制兼容", "库版本"], [
        "ABI 可以理解为二进制层面的接口约定，包括函数调用约定、名字修饰、对象布局、异常模型等。",
        "源码兼容不代表二进制兼容，哪怕头文件没变，只要 ABI 变了，动态库和可执行程序之间也可能在运行时出问题。",
        "这也是为什么很多大型 C++ 项目在升级编译器、标准库或第三方库时非常谨慎，需要关注整个工具链一致性。",
        "如果能把 ABI 和 API 区分清楚，再结合动态库加载、符号不匹配这类场景来回答，会比较像真实工程经验。"
      ]),
      q("advanced-cpp-customization-point", "advanced", false, "什么叫 ADL？为什么泛型代码里要理解它？", ["ADL", "泛型", "名字查找"], [
        "ADL 是参数相关查找，函数调用时编译器除了看当前作用域，还会去实参类型所在命名空间里找匹配函数。",
        "它让很多泛型代码可以在不写死命名空间的情况下支持用户自定义类型，比如 swap、begin、end 这类扩展点。",
        "但 ADL 也会让名字查找更隐蔽，带来候选冲突和调用结果不直观的问题。",
        "面试里如果能把它和泛型库扩展机制联系起来，而不是只背定义，会更有说服力。"
      ])
    ],
    "C++ 工程场景": [
      q("cpp-scenario-interface-design", "intermediate", true, "设计一个公共 C++ 接口时，你最看重哪些原则？", ["接口设计", "封装", "契约"], [
        "首先要明确接口表达的语义，比如参数是否可空、对象是否拥有资源、调用失败怎么反馈，这些比函数名本身更重要。",
        "其次要控制暴露面，尽量只暴露稳定抽象，把实现细节、可变策略和第三方依赖隔离在实现层。",
        "如果接口给别人长期使用，还要考虑异常安全、线程安全、版本演进和二进制兼容问题。",
        "一个成熟回答通常不会停在“高内聚低耦合”，而会落到引用还是指针、返回值还是异常、值语义还是对象所有权这些具体设计点。"
      ]),
      q("cpp-scenario-review", "intermediate", true, "做 C++ 代码评审时，你优先看哪些问题？", ["代码评审", "review"], [
        "我通常先看正确性和边界条件，比如生命周期是否清晰、并发访问是否安全、异常路径是否会泄漏资源。",
        "第二层看接口和抽象是否合理，是否引入了不必要的耦合、隐藏的所有权、难以维护的模板或继承关系。",
        "第三层再看性能和风格，包括是否存在不必要拷贝、容器选型不当、日志过度或命名不清。",
        "真正高质量的 review 不是逐行挑格式，而是优先发现会影响正确性、演进性和线上风险的问题。"
      ]),
      q("cpp-scenario-performance-hotspot", "intermediate", true, "线上 C++ 服务性能突然变差，你会怎么做第一轮排查？", ["性能排查", "热点", "perf"], [
        "第一步先确定是 CPU、内存、锁竞争、磁盘 IO 还是网络等待，不要一上来就拍脑袋改代码。",
        "第二步定位到具体进程、线程和热点调用链，常见工具包括 perf、火焰图、日志埋点和监控指标。",
        "第三步把技术热点和业务现象对应起来，因为“某函数很热”本身不是根因，只是现象。",
        "成熟的回答应该体现你会先量化问题、缩小范围，再针对瓶颈做优化，而不是直接说“换成多线程”之类的大动作。"
      ]),
      q("cpp-scenario-memory-growth", "intermediate", true, "如果线上内存持续上涨，但程序不崩，你怎么区分是泄漏、缓存还是碎片？", ["内存上涨", "泄漏", "缓存"], [
        "我会先看增长是否跟流量相关、峰值后是否回落，以及不同内存指标是匿名页涨、映射文件涨还是堆对象涨。",
        "如果增长可回落，更像缓存或工作集变化；如果长期单调上升且和业务无关，就要重点怀疑泄漏。",
        "还要结合分配器行为考虑内存碎片问题，因为有时对象已经释放，但内存没有及时回到系统。",
        "这类题的关键不是背工具，而是先把问题分型，再决定该看对象计数、heap profile 还是缓存策略。"
      ]),
      q("cpp-scenario-library-choice", "intermediate", false, "什么时候你会选择第三方库，什么时候更倾向自己实现？", ["第三方库", "工程取舍"], [
        "如果问题是通用领域且已有成熟库，比如 JSON、日志、网络协议、测试框架，优先复用成熟方案通常更稳。",
        "如果需求非常定制、性能边界特殊、依赖成本高，或者库本身会带来更大维护负担，才考虑自己实现。",
        "选择的核心不是“是否会造轮子”，而是长期维护成本、风险、性能收益和团队掌控力。",
        "面试里如果能同时提到许可证、版本升级、二进制兼容和安全更新，就会比单纯谈功能更工程化。"
      ]),
      q("cpp-scenario-error-handling", "intermediate", true, "在 C++ 项目里，异常、错误码、optional 这几种错误处理方式怎么选？", ["错误处理", "异常", "optional"], [
        "如果错误属于真正的异常流程，而且需要跨多层调用栈统一回退和清理，异常机制通常表达力更强。",
        "如果项目对性能、边界稳定性或跨语言接口要求高，错误码往往更显式、更容易形成统一约定。",
        "optional 更适合表达“可能没有值，但这不一定是错误”的场景，比如查找失败或可选结果。",
        "好的回答不是说哪一种绝对更高级，而是说明你会根据失败语义、调用层级、性能目标和团队风格来做选择。"
      ]),
      q("cpp-scenario-thread-pool", "advanced", true, "如果让你设计一个线程池，除了能跑任务之外还要考虑什么？", ["线程池", "并发设计"], [
        "除了基本的任务队列和工作线程，还要考虑任务提交失败、停止语义、析构时机和线程退出流程。",
        "如果线程池用于生产环境，还需要考虑队列容量限制、背压策略、异常传播、监控统计和任务超时。",
        "再往深一点，还会涉及任务优先级、工作窃取、绑核、上下文传递和延迟任务调度等扩展能力。",
        "面试里把这些工程边界说出来，往往比手写一个最简 while 循环线程池更能体现水平。"
      ]),
      q("cpp-scenario-plugin", "advanced", false, "如果你要做一个插件化或模块化的 C++ 系统，会注意哪些风险？", ["插件", "模块化", "动态库"], [
        "首先要设计清晰稳定的边界接口，尽量减少把复杂 C++ 类型直接暴露到模块边界，尤其要警惕 ABI 风险。",
        "其次要考虑对象创建销毁责任、异常传播边界、线程模型和版本兼容，否则插件升级很容易出现运行时问题。",
        "如果依赖动态库加载，还要关注符号可见性、生命周期管理、卸载顺序和资源回收。",
        "回答这类题时，能把“接口稳定性 + 生命周期 + ABI + 诊断能力”串起来，通常就已经很像真实工程设计了。"
      ])
    ],
    "Linux 基础": [
      q("linux-rwx", "basic", true, "Linux 文件权限中的 rwx 分别表示什么？", ["Linux", "权限"], [
        "r、w、x 分别表示读、写、执行权限。",
        "它们分别作用在 owner、group、other 三组主体上。",
        "排查权限问题时，不只看权限位，还要看属主属组和实际执行用户。"
      ]),
      q("linux-chmod-chown", "basic", true, "chmod、chown、chgrp 分别是做什么的？", ["chmod", "chown"], [
        "chmod 修改权限位，决定谁能读写执行。",
        "chown 修改文件属主，chgrp 修改所属组。",
        "线上问题里权限位和拥有者往往要一起排查，单改一个不一定够。"
      ]),
      q("linux-hard-soft-link", "intermediate", true, "硬链接和软链接的区别是什么？", ["硬链接", "软链接"], [
        "硬链接共享 inode，本质上是多个名字指向同一文件实体。",
        "软链接保存目标路径，更像快捷方式，目标没了就会悬挂。",
        "硬链接一般不能跨文件系统，也不适合随意链接目录。"
      ]),
      q("linux-common-tools", "basic", true, "ps、top、free、vmstat、iostat 分别常看什么？", ["top", "vmstat", "iostat"], [
        "ps/top 看进程和线程状态，free 看内存总体使用。",
        "vmstat 适合看系统级调度、内存和 IO 等指标变化。",
        "iostat 更偏磁盘与块设备吞吐和等待时间分析。"
      ]),
      q("linux-port-process", "basic", true, "如何查看某个端口被哪个进程占用？", ["端口", "lsof", "ss"], [
        "常见做法是用 `ss -lntp` 或 `lsof -i:<port>`。",
        "看到 PID 后再结合 ps、top 或日志定位具体服务实例。",
        "在容器环境里还要注意 namespace、sidecar 和端口映射层。"
      ]),
      q("linux-procfs", "intermediate", false, "/proc 文件系统有什么价值？", ["/proc"], [
        "/proc 是内核暴露运行时信息的重要接口，很多系统状态都能从这里读取。",
        "例如 `/proc/<pid>/maps`、`status`、`fd` 对排查内存、线程和句柄问题很有帮助。",
        "理解 /proc 能帮助你把命令行工具输出和内核状态对应起来。"
      ]),
      q("linux-user-kernel-mode", "basic", true, "用户态和内核态的区别是什么？", ["用户态", "内核态"], [
        "用户态权限受限，主要执行普通应用逻辑；内核态权限更高，可直接操作硬件和核心资源。",
        "系统调用会触发从用户态进入内核态，这种切换有成本。",
        "很多性能问题本质上就是系统调用频繁或上下文切换过多。"
      ]),
      q("linux-open-fd", "intermediate", false, "为什么排查服务问题时经常要看文件描述符？", ["fd", "文件描述符"], [
        "socket、文件、管道等很多资源在 Linux 下都统一抽象成文件描述符。",
        "fd 泄漏会导致连接失败、无法打开文件或资源耗尽。",
        "查看 `/proc/<pid>/fd` 或 `lsof` 往往能快速发现泄漏方向。"
      ]),
      q("linux-grep-awk-sed", "basic", false, "grep、awk、sed 各自更适合什么任务？", ["grep", "awk", "sed"], [
        "grep 擅长查找匹配行，适合快速过滤文本。",
        "awk 擅长按列和规则处理结构化文本，适合报表和日志提取。",
        "sed 更适合流式替换和简单编辑，三者组合在日志排查里非常高频。"
      ]),
      q("linux-mmap", "advanced", false, "mmap 常见用途是什么？它和 read/write 有什么思路差异？", ["mmap"], [
        "mmap 把文件或匿名内存映射进进程地址空间，让访问更像普通内存操作。",
        "它常用于大文件处理、共享内存和某些零拷贝优化场景。",
        "但使用 mmap 也要考虑页错误、同步时机和地址空间管理复杂度。"
      ]),
      q("linux-signal-basics", "intermediate", true, "什么是信号？常见信号有哪些？", ["signal", "SIGTERM"], [
        "信号是内核向进程发送的异步通知机制，用于表示事件或请求动作。",
        "常见如 `SIGINT`、`SIGTERM`、`SIGKILL`、`SIGSEGV`，语义和可处理性不同。",
        "面试里最好说明 `SIGKILL` 不能被捕获或忽略，而 `SIGTERM` 更适合优雅退出。"
      ])
    ],
    "进程与线程": [
      q("proc-thread-diff", "basic", true, "进程和线程的区别是什么？", ["进程", "线程"], [
        "进程是资源分配的基本单位，线程是调度执行的基本单位。",
        "线程共享进程的大部分资源，进程之间默认隔离更强。",
        "线程切换更轻，但共享资源带来的同步复杂度也更高。"
      ]),
      q("proc-fork", "basic", true, "fork 做了什么？", ["fork"], [
        "fork 会创建一个几乎与父进程相同的子进程，两者从 fork 返回处继续执行。",
        "返回值不同让父子进程走不同逻辑，子进程拿到 0，父进程拿到子进程 PID。",
        "现代系统通常通过写时复制减少直接复制全部地址空间的成本。"
      ]),
      q("proc-exec", "basic", true, "exec 和 fork 的关系是什么？", ["exec", "fork"], [
        "fork 复制现有进程上下文，exec 用新程序映像替换当前进程内容。",
        "很多服务启动流程是先 fork 再在子进程 exec 目标程序。",
        "这套组合让创建新进程和加载新程序这两个动作保持解耦。"
      ]),
      q("proc-zombie-orphan", "basic", true, "什么是僵尸进程和孤儿进程？", ["僵尸进程", "孤儿进程"], [
        "子进程退出但父进程还没 wait 回收时，会暂时成为僵尸进程。",
        "父进程先退出后，子进程会被 init 或其他收养进程接管，成为孤儿进程。",
        "真正麻烦的是大量僵尸会耗尽 PID 资源，因此必须及时回收。"
      ]),
      q("proc-waitpid", "basic", true, "wait 和 waitpid 的区别是什么？", ["waitpid"], [
        "wait 更简单，回收任意一个已退出子进程。",
        "waitpid 更灵活，可指定 PID、非阻塞选项或特定行为。",
        "实际服务中，waitpid 更适合多子进程管理和事件循环集成。"
      ]),
      q("thread-create-join", "basic", true, "线程创建和回收一般怎么做？", ["pthread_create", "join"], [
        "POSIX 线程常用 `pthread_create` 创建，`pthread_join` 等待回收。",
        "C++ 标准线程则是 `std::thread`，在析构前要 join 或 detach。",
        "工程里比 API 更重要的是线程生命周期清晰，避免野线程和退出悬挂。"
      ]),
      q("proc-context-switch", "intermediate", true, "什么是上下文切换？为什么它会有成本？", ["上下文切换"], [
        "上下文切换是 CPU 在不同执行实体之间保存和恢复执行状态的过程。",
        "成本来自寄存器、调度、缓存失效、TLB 影响以及可能的内核参与。",
        "高并发不等于无限多线程，过度切换会直接吃掉性能。"
      ]),
      q("proc-thread-local", "intermediate", false, "什么是线程局部存储（TLS）？什么时候适合使用？", ["TLS", "thread_local"], [
        "TLS 为每个线程提供独立的一份变量实例，避免某些共享数据竞争。",
        "它适合缓存线程私有上下文、统计信息或小型状态对象。",
        "但如果状态过重或线程数很多，也会放大内存占用。"
      ]),
      q("proc-cpu-affinity", "advanced", false, "什么时候会考虑绑核（CPU affinity）？", ["CPU affinity", "绑核"], [
        "对实时性敏感、缓存局部性重要或线程角色固定的场景，绑核有时能降低抖动。",
        "它常见于通信、交易、数据包处理等尾时延敏感系统。",
        "但绑核不是万能优化，线程分布不均时也可能造成热点和资源浪费。"
      ]),
      q("proc-daemon", "intermediate", false, "守护进程的核心特征是什么？", ["daemon"], [
        "守护进程通常脱离终端、在后台长期运行，并有自己的日志和信号处理策略。",
        "经典实现会处理会话、工作目录、文件描述符等环境清理。",
        "现代系统中很多守护进程交由 systemd 等管理，但理解原理仍然重要。"
      ]),
      q("thread-std-vs-pthread", "intermediate", false, "std::thread 和 pthread 应该如何理解？", ["std::thread", "pthread"], [
        "std::thread 是 C++ 标准库层封装，接口更贴近现代 C++ 风格。",
        "pthread 是更底层的 POSIX 线程接口，可控性更强，也更接近系统能力。",
        "工程上通常优先用标准库，除非你确实需要依赖平台特性。"
      ])
    ],
    "同步与并发": [
      q("sync-mutex", "basic", true, "什么是互斥锁？", ["mutex"], [
        "互斥锁用于保证同一时刻只有一个线程进入临界区。",
        "它保护的是共享状态的一致性，而不是线程本身。",
        "回答时最好补一句：锁的粒度和持有时间会直接影响吞吐和尾时延。"
      ]),
      q("sync-deadlock", "basic", true, "什么是死锁？如何避免？", ["死锁"], [
        "死锁是多个线程互相等待对方持有的资源，最终谁都走不下去。",
        "避免方法包括固定加锁顺序、缩小临界区、减少嵌套锁和使用超时策略。",
        "排查时常结合线程栈、锁顺序和日志来定位。"
      ]),
      q("sync-condition-variable", "intermediate", true, "条件变量的典型使用场景是什么？", ["条件变量"], [
        "条件变量适合线程等待某个状态成立再继续，比如任务队列和生产者消费者。",
        "它通常与 mutex 搭配使用，保证状态检查和休眠切换的正确性。",
        "要用谓词循环判断，防止伪唤醒或被其他线程抢先消费条件。"
      ]),
      q("sync-atomic-vs-mutex", "intermediate", true, "atomic 和 mutex 的区别是什么？", ["atomic", "mutex"], [
        "atomic 适合简单共享变量的原子读改写，不需要把多个操作绑成事务。",
        "mutex 适合保护更复杂的不变量和多步状态更新。",
        "别把 atomic 当作“更快的锁”，是否适用取决于问题本身。"
      ]),
      q("sync-cas-aba", "advanced", false, "什么是 CAS？ABA 问题是什么？", ["CAS", "ABA"], [
        "CAS 通过比较当前值是否等于预期值来决定是否原子更新。",
        "ABA 指值看起来没变，但中间其实经历过变化，可能让算法误判状态稳定。",
        "解决方法常见有版本号、tag pointer 或更高层的数据结构设计。"
      ]),
      q("sync-memory-order", "advanced", false, "为什么并发编程里要关心内存可见性和重排序？", ["memory order"], [
        "多线程问题不只是“会不会同时写”，还包括一个线程是否能及时看见另一个线程的更新。",
        "编译器和 CPU 都可能做重排序，如果没有同步原语，执行顺序未必符合直觉。",
        "这也是为什么 atomic 需要 memory order 语义，而不是只有原子读写就够。"
      ]),
      q("sync-rwlock", "intermediate", false, "读写锁适合什么场景？", ["读写锁"], [
        "当读远多于写，且读操作之间可以并发时，读写锁可能优于普通互斥锁。",
        "但写线程饥饿、公平性和实现开销都要考虑，不是所有读多写少场景都一定更快。",
        "回答时强调“先测量再选型”会更工程化。"
      ]),
      q("sync-semaphore", "intermediate", false, "信号量常用来解决什么问题？", ["semaphore"], [
        "信号量常用于控制并发访问数量，例如资源池、生产消费计数或限流。",
        "与 mutex 不同，它表达的是“许可数量”，不只是互斥进入。",
        "在跨线程甚至跨进程协作里，信号量都可能出现。"
      ]),
      q("sync-thread-safe", "basic", true, "什么叫线程安全？如何判断一个类是否线程安全？", ["线程安全"], [
        "线程安全意味着多个线程并发调用时，结果仍满足预期且不会破坏内部状态。",
        "判断时要看共享状态是否被正确同步，接口契约是否说明并发使用方式。",
        "真正的线程安全不仅是“不崩”，还包括数据一致性和可维护性。"
      ]),
      q("sync-producer-consumer", "basic", true, "什么是生产者消费者模型？", ["生产者消费者"], [
        "生产者消费者模型把数据生成和数据处理解耦，通过缓冲区或队列连接两者。",
        "它可以平滑处理速率不匹配的问题，也是任务队列、日志管道的常见结构。",
        "回答时可以顺带提到容量控制、阻塞策略和背压。"
      ]),
      q("sync-false-sharing", "advanced", false, "什么是伪共享（false sharing）？", ["false sharing"], [
        "不同线程修改不同变量，但这些变量落在同一个 cache line 上，也会引发缓存争用。",
        "它会导致看似没有共享数据依赖的代码依然性能很差。",
        "常见优化包括 padding、按线程分片和调整数据布局。"
      ])
    ],
    "IPC 与网络": [
      q("ipc-pipe-fifo", "basic", true, "pipe 和 FIFO 的区别是什么？", ["pipe", "FIFO"], [
        "匿名 pipe 通常用于有亲缘关系进程之间，创建和生命周期更临时。",
        "FIFO 是命名管道，存在于文件系统中，不要求通信双方有父子关系。",
        "两者都适合简单字节流通信，但复杂度和性能能力有限。"
      ]),
      q("ipc-message-queue", "intermediate", false, "消息队列适合什么场景？", ["消息队列", "IPC"], [
        "消息队列适合保留消息边界、按消息粒度发送和接收的场景。",
        "相比纯字节流，它更自然地表达离散事件或命令。",
        "但容量、优先级、公平性和持久化语义要看具体实现。"
      ]),
      q("ipc-shared-memory", "intermediate", true, "共享内存为什么速度快？主要风险是什么？", ["共享内存"], [
        "共享内存避免了内核来回复制大块数据，因此吞吐量和时延都更好。",
        "但它把同步责任交给应用自己处理，容易出现竞态和边界错误。",
        "在高性能系统里常配合信号量、环形队列和严格协议一起使用。"
      ]),
      q("ipc-socket-local", "intermediate", false, "socket 能不能用于本机进程通信？为什么仍有人这么做？", ["socket", "IPC"], [
        "可以，本地域 socket（Unix domain socket）就是常见方案。",
        "它统一了通信接口，也方便把本地通信与远程通信模型保持一致。",
        "相比共享内存，它通常更简单稳健，但纯性能未必最好。"
      ]),
      q("net-tcp-vs-udp", "basic", true, "TCP 和 UDP 的区别是什么？", ["TCP", "UDP"], [
        "TCP 面向连接、可靠有序、带重传和流控；UDP 无连接、尽力而为。",
        "TCP 更适合可靠性优先的业务，UDP 更适合时延优先或上层自控重传的业务。",
        "核心不是谁更高级，而是需求侧的可靠性与实时性权衡。"
      ]),
      q("net-three-way-handshake", "basic", true, "为什么 TCP 需要三次握手？", ["三次握手"], [
        "三次握手要完成双方初始序列号同步，并确认双方都有收发能力。",
        "如果只有两次，某些历史连接或延迟报文会带来状态歧义。",
        "面试里说清它是“连接状态同步协议”，比背流程更重要。"
      ]),
      q("net-four-way-close", "intermediate", true, "为什么 TCP 挥手通常是四次？", ["四次挥手"], [
        "TCP 连接是全双工的，双方关闭发送方向通常需要分别确认。",
        "一端发送 FIN 只表示自己不再发送，不代表另一端也立即结束发送。",
        "所以关闭连接通常拆成两个方向分别完成。"
      ]),
      q("net-select-poll-epoll", "intermediate", true, "select、poll、epoll 的区别是什么？", ["epoll", "select"], [
        "select 有 fd 上限且每次都要线性扫描全集，poll 虽无位图上限但仍要遍历。",
        "epoll 把关注集合和就绪事件管理更多下沉到内核里，减少无效扫描。",
        "高并发时 epoll 通常更优，但还要看活跃连接比例和处理模型。"
      ]),
      q("net-lt-et", "advanced", true, "epoll 的 LT 和 ET 模式有什么区别？", ["LT", "ET", "epoll"], [
        "LT 只要缓冲区仍有数据就持续通知，编码简单。",
        "ET 只在状态变化时通知一次，要求尽量把数据一次性读写到 `EAGAIN`。",
        "ET 更容易提升效率，但没处理好非阻塞和读空逻辑就可能丢事件。"
      ]),
      q("net-sticky-packet", "intermediate", true, "什么是粘包和拆包？如何解决？", ["粘包", "拆包"], [
        "TCP 是字节流，没有天然消息边界，所以接收端可能一次读到多条或半条业务消息。",
        "常见解决方式是长度字段、固定包头、分隔符或更完整的协议编解码层。",
        "面试里最好说明：这不是 TCP 的 bug，而是应用层消息边界设计问题。"
      ]),
      q("net-recv-zero-timewait", "intermediate", false, "recv 返回 0 表示什么？为什么会出现大量 TIME_WAIT？", ["recv", "TIME_WAIT"], [
        "recv 返回 0 通常表示对端已经有序关闭连接。",
        "TIME_WAIT 是主动关闭方为确保迟到报文不污染新连接而保留的状态。",
        "大量 TIME_WAIT 未必是 bug，但若影响资源，需要结合短连接模型和端口复用策略分析。"
      ])
    ],
    "调试与排障": [
      q("debug-segfault", "basic", true, "段错误一般怎么排查？", ["segfault", "gdb"], [
        "先确认是否有 core dump，再用 gdb 看崩溃栈、寄存器和局部变量。",
        "重点怀疑空指针、越界、悬空指针和并发下失效对象访问。",
        "如果难复现，可结合 ASan、最小用例和最近改动缩小范围。"
      ]),
      q("debug-gdb", "basic", true, "gdb 最常用来做哪几件事？", ["gdb"], [
        "看调用栈、切换 frame、打印变量和查看线程是最常见用法。",
        "它也能打断点、单步、观察表达式，适合分析复现问题。",
        "对于 core dump，gdb 让你在事后重建崩溃现场。"
      ]),
      q("debug-core-dump", "intermediate", true, "core dump 是什么？怎么打开？", ["core dump"], [
        "core dump 是进程崩溃时留下的内存镜像文件，用于离线分析现场。",
        "常见需要检查 `ulimit -c`、core_pattern 和服务运行环境权限。",
        "有了 core 才能更高效地追溯崩溃点，而不是完全靠猜。"
      ]),
      q("debug-strace", "intermediate", false, "strace 和 ltrace 分别更适合看什么？", ["strace", "ltrace"], [
        "strace 关注系统调用层，比如 open、read、connect、futex。",
        "ltrace 更关注动态库函数调用层。",
        "服务卡住、权限问题、连接失败时，strace 往往非常高效。"
      ]),
      q("debug-sanitizers", "intermediate", true, "ASan、TSan、UBSan 分别解决什么问题？", ["ASan", "TSan", "UBSan"], [
        "ASan 主要抓越界、use-after-free 等内存错误。",
        "TSan 用于发现数据竞争，UBSan 用于发现未定义行为。",
        "这些工具很适合开发和测试环境，但上线环境要考虑开销。"
      ]),
      q("debug-ldd-nm", "intermediate", false, "ldd、nm、objdump 这类工具在什么场景有用？", ["ldd", "nm", "objdump"], [
        "ldd 常用于查看程序依赖了哪些动态库。",
        "nm 和 objdump 更适合看符号、节区和二进制细节。",
        "库加载失败、符号未定义或 ABI 问题时，这类工具很关键。"
      ]),
      q("debug-log-design", "intermediate", true, "日志该怎么设计才更有利于排障？", ["日志", "trace id"], [
        "日志至少要能关联请求上下文、模块、时间和关键状态变化。",
        "高价值日志强调少而准，而不是无脑把全部变量都打出来。",
        "最好支持 trace id、错误码和分级，方便线上检索和聚合。"
      ]),
      q("debug-reproduce", "intermediate", true, "遇到偶发 bug 时，如何构造最小复现？", ["最小复现"], [
        "先从现象抽取关键输入、环境和时序条件，逐步剥离无关因素。",
        "把复现条件固定成脚本或测试样例，比口头描述更可靠。",
        "最小复现不仅帮助修 bug，也能沉淀成回归用例。"
      ]),
      q("debug-race-condition", "advanced", false, "并发竞态问题为什么难排查？你通常怎么定位？", ["竞态", "race"], [
        "竞态依赖特定时序，复现不稳定，日志往往也不能完全还原。",
        "常用方法包括加更细粒度日志、缩小线程交互范围、引入工具如 TSan。",
        "修复时不能只靠加锁，还要确认状态机和生命周期设计本身合理。"
      ]),
      q("debug-service-hang", "intermediate", true, "服务卡死但不崩溃时，排查路径是什么？", ["卡死", "hang"], [
        "先看线程栈，判断是死锁、阻塞 IO、忙循环还是外部依赖卡住。",
        "再结合 CPU、系统调用、锁等待和网络状态信息缩小范围。",
        "“不崩溃”不代表问题更简单，很多复杂线上事故恰恰是 hang。"
      ]),
      q("debug-latency-spike", "advanced", false, "出现偶发时延尖峰时，你会从哪些维度排查？", ["时延尖峰", "latency"], [
        "先区分是输入流量变化、排队延迟、锁争用还是 IO 抖动造成。",
        "再看尾时延关联的线程、队列深度、系统调度和外部依赖响应。",
        "时延问题最怕只看平均值，必须盯住分位数和最坏情况。"
      ])
    ],
    "调试工具直讲": [
      q("debug-tool-pick", "basic", true, "线上出问题时，你按什么标准选调试工具？", ["排查思路", "工具选型", "调试"], [
        "调试最耗时的往往不是用工具，而是选错了工具。先把现象归类，工具基本就定了。",
        "崩溃且有 core，直接 gdb 加载 core 看栈；崩溃却没有 core，多半是被 kill -9 或 OOM Killer 杀的，要去看 dmesg 和 ulimit。",
        "进程卡住不动，用 pstack 或 gdb attach 打印所有线程栈；CPU 打满用 perf top 和火焰图找热点函数。",
        "慢但 CPU 不高，说明时间花在等待上，看锁和 IO；行为诡异（读错文件、权限不对）就上 strace，系统调用不会撒谎。",
        "能重新编译并复现的，优先上 Sanitizer，它会把问题拦在第一现场，而不是等很久之后在别处崩掉。"
      ], {
        diagramSteps: [
          "第一步先问：进程还在不在？不在就是崩溃或被杀，在就是卡住、慢或结果不对。",
          "崩溃类：有 core 走 gdb，没 core 先查 dmesg 确认是不是被 SIGKILL 带走的。",
          "卡住类：拿到全部线程栈，看是都停在锁上（死锁）还是停在 epoll_wait（只是没活干）。",
          "慢速类：先用 perf stat 看是不是在烧 CPU，是就用火焰图找热点，不是就查等待。",
          "结果错类：能重编就 ASan/TSan，不能重编就 valgrind。",
          "全程记住留基线：改动前后都要有可对比的数据，否则说不清是不是真修好了。"
        ],
        pitfalls: [
          "一上来就 gdb 单步，其实很多问题（性能、竞争、泄漏）用单步根本查不出来。",
          "在生产上长时间开 strace，会让程序慢几十倍，对延迟敏感的服务是二次事故。",
          "只看平均值不看分位数，长尾问题会被完全掩盖。",
          "拿不到 core 就放弃，其实 ulimit、core_pattern、磁盘空间任何一个没配好都会导致 core 落不了地。"
        ],
        complexity: [
          "这题考的是排查方法论，面试官想听的是分类思维，而不是工具清单。",
          "回答时最好带一个自己真实排查过的例子：什么现象、怎么缩小范围、最后用哪个工具坐实。"
        ]
      }),
      q("debug-tool-gdb-breakpoint", "basic", true, "gdb 的条件断点怎么用？循环里只想停某一次该怎么办？", ["gdb", "条件断点", "ignore"], [
        "普通断点在循环里会命中几十万次，根本没法用，条件断点就是为这个场景设计的。",
        "写法是 break 位置 if 条件，比如 break process if orderId == 88888，只有条件成立才真正停下。",
        "已经下好的断点也能补条件：condition 2 id == 1001，不用删了重下。",
        "如果条件不好写，但知道大概第几次出问题，用 ignore 断点号 次数 直接跳过前 N 次。",
        "还有 tbreak 一次性断点，命中后自动删除，适合只想在初始化时看一眼的场景。"
      ], {
        diagramSteps: [
          "先用 break 文件:行号 或 break 函数名 下一个普通断点，run 起来确认能命中。",
          "info breakpoints 看断点编号，这个编号后面加条件、删除、禁用都要用。",
          "条件断点的判断是在 gdb 里做的，所以条件表达式能用当前作用域的变量和函数。",
          "命中后用 bt 看栈、info locals 看局部变量，确认是不是你要找的那一次。",
          "如果发现条件写宽了还是停太多次，就在原断点上追加 ignore 跳过一批。",
          "定位完记得 delete 掉，否则后面 continue 会一直被打断。"
        ],
        pitfalls: [
          "条件断点每次都要在 gdb 里求值，命中次数极多时会明显拖慢程序，条件要尽量写得早筛。",
          "条件里调用了有副作用的函数，会改变程序行为，等于观察本身干扰了结果。",
          "在优化过的二进制上，条件里引用的变量可能是 <optimized out>，需要改用 -Og 重编。",
          "断点设在被内联的函数上可能永远不命中，要加 -fno-inline 或改设在调用点。"
        ],
        cppCode: "# 只在特定订单号时停下\nbreak order.cpp:120 if orderId == 88888\n\n# 组合条件\nbreak vec.cpp:42 if i > 10000 && ptr == nullptr\n\n# 给已有的 2 号断点补条件\ncondition 2 price > 100.0\n\n# 跳过 1 号断点的前 5000 次命中\nignore 1 5000\n\n# 一次性断点，命中后自动删除\ntbreak main\n",
        complexity: [
          "条件断点是把定位成本从人工数次数变成机器判断，是 gdb 里性价比最高的技巧之一。",
          "延伸问题常问 watchpoint 和 catch throw，可以顺着一起讲。"
        ]
      }),
      q("debug-tool-gdb-watch", "intermediate", true, "一个变量被莫名其妙改成了脏值，怎么找出是谁改的？", ["gdb", "watchpoint", "观察点"], [
        "用观察点 watch，这是 gdb 里最被低估的功能，专门回答“到底是谁改了我的变量”。",
        "watch 变量名 表示值被修改时停下，并且会同时打印改前值和改后值；停下后一个 bt 就是凶手的调用栈。",
        "rwatch 是被读取时停，awatch 是读或写都停，按需要选。",
        "指针成员建议用 watch -l ptr->field，-l 会锁定当前地址，避免指针本身变了之后跟丢。",
        "硬件观察点通常只有 4 个（受 CPU 调试寄存器限制），超了会退化成软件观察点，速度慢上百倍。"
      ], {
        diagramSteps: [
          "先 start 让程序停在 main，确保要观察的变量已经存在、地址已确定。",
          "watch 目标变量，gdb 会用 CPU 的调试寄存器盯住这块内存。",
          "continue 让程序跑，一旦有任何代码写这块内存，立刻中断。",
          "gdb 会打印 Old value 和 New value，一眼就知道被改成了什么。",
          "紧接着 bt 打印调用栈，写入的代码路径就完全暴露了。",
          "如果怀疑是越界写而不是正常赋值，栈里会出现完全不相干的函数，这时应转去用 ASan。"
        ],
        pitfalls: [
          "变量离开作用域后观察点会自动失效，局部变量要注意观察时机。",
          "硬件观察点数量有限，一次盯太多会退化成软件观察点，程序慢到没法跑。",
          "观察的是地址不是名字，如果被观察对象所在的容器扩容搬家了，原地址就不再是那个变量。",
          "多线程下任何线程的写入都会触发，要结合 info threads 确认是哪个线程干的。"
        ],
        cppCode: "gdb ./prog\nstart\n\n# 盯住全局配置里的超时字段\nwatch g_config.timeout\n\n# 锁定地址，避免 ptr 改指向后跟丢\nwatch -l conn->state\n\ncontinue\n# Hardware watchpoint 2: g_config.timeout\n#   Old value = 3000\n#   New value = 0\n\nbt          # 凶手的调用栈就在这里\n",
        complexity: [
          "观察点把“全代码搜索谁写了这个变量”变成一次运行就定位，尤其适合有大量间接赋值的老代码。",
          "如果发现是越界写导致的内存被踩，后续应该切到 AddressSanitizer 继续查。"
        ]
      }),
      q("debug-tool-gdb-deadlock", "intermediate", true, "服务卡死不响应，怎么用 gdb 判断是不是死锁？", ["gdb", "死锁", "线程栈"], [
        "核心命令只有一条：thread apply all bt，把所有线程的调用栈一次打出来。",
        "如果不想让 gdb 长时间占住进程，用 pstack pid 更快，或者 gdb -p pid -batch -ex \"thread apply all bt\" -ex detach 一次性拿完就走。",
        "判读方法：多个线程都停在 pthread_mutex_lock 或 __lll_lock_wait 上，基本可以确定是锁等待；再看它们各自已经持有哪把锁，确认是不是 A→B、B→A 交叉。",
        "如果绝大多数线程停在 epoll_wait 或条件变量的 wait 上，那不是死锁，而是没活干，或者是漏了 notify 导致唤不醒。",
        "还要排除一种情况：卡在 read/write 等 IO 上，那是对端不回包或磁盘慢，属于外部依赖问题而不是本地死锁。"
      ], {
        diagramSteps: [
          "先确认进程还活着但 CPU 占用很低，这符合“在等待”而不是“在忙循环”的特征。",
          "attach 上去或用 pstack 拿到全部线程栈，注意 gdb attach 会暂停整个进程，生产上要快进快出。",
          "扫一遍所有栈顶函数，把线程分成三类：等锁的、等事件的、等 IO 的。",
          "对等锁的那批，找出它们停在哪一行，回到代码看这条路径上此前已经加了哪些锁。",
          "画出“谁持有什么、谁在等什么”的关系，出现环就是死锁。",
          "没有环但都在等锁，说明是某个线程长期持锁不放，要去看那个线程在干什么慢活。"
        ],
        pitfalls: [
          "用 quit 退出 gdb 在某些情况下会连带杀掉被调试进程，生产上必须用 detach。",
          "只看一个线程的栈得不出结论，死锁本质是多线程之间的关系。",
          "线程栈里全是 ?? 说明缺符号，要确认线上二进制没有被 strip、且和符号文件版本匹配。",
          "把“大量线程停在 epoll_wait”误判成死锁，那其实是正常空闲状态。"
        ],
        cppCode: "# 最快：不进交互式 gdb\npstack <pid>\n\n# 或者一次性导出后立刻脱离\ngdb -p <pid> -batch -ex \"thread apply all bt\" -ex detach\n\n# 典型的死锁栈形态：\n# Thread 3: __lll_lock_wait -> pthread_mutex_lock -> Account::transfer\n# Thread 5: __lll_lock_wait -> pthread_mutex_lock -> Account::refund\n#   两个线程都卡在 lock 上，且互相持有对方要的锁\n",
        complexity: [
          "这是线上 hang 类事故最常用的一招，几乎不需要额外准备，成本极低。",
          "预防层面可以讲固定加锁顺序、std::scoped_lock 一次锁多把、以及尽量缩小临界区。"
        ]
      }),
      q("debug-tool-gdb-catch-throw", "advanced", false, "怎么抓到 C++ 异常抛出的第一现场？", ["gdb", "catch throw", "异常"], [
        "在 catch 块里下断点是没用的，因为那时栈已经展开完了，真正抛出点的现场已经销毁。",
        "正确做法是 catch throw，它会在异常被抛出的那一刻停下，此时抛出点的完整调用栈还在。",
        "等价写法是 break __cxa_throw，效果一样，某些老版本 gdb 上更可靠。",
        "catch catch 是在异常被捕获时停，配合使用可以看清一次异常的完整传播路径。",
        "assert 失败和未捕获异常最终都会走到 abort，所以 break abort 也是常备的一手。"
      ], {
        diagramSteps: [
          "启动 gdb，先 catch throw 注册异常捕获点，再 run。",
          "程序抛出异常时 gdb 立刻中断，此时还没有开始栈展开。",
          "bt 打印栈，最顶上几帧就是抛出异常的具体代码位置。",
          "info locals 看当时的局部变量，判断是什么输入触发了这个异常。",
          "如果异常太多，可以配合条件：先跑到可疑阶段再启用这个捕获点。",
          "确认原因后 delete 掉捕获点，继续验证修复效果。"
        ],
        pitfalls: [
          "catch throw 会拦下所有异常，包括框架内部正常使用的异常，噪音可能很大。",
          "在 release 优化构建上，栈可能因为内联而不完整，必要时加 -fno-inline。",
          "只关注最后那个 catch 而忽略中间的 rethrow，会漏掉真正的源头。",
          "有些库把异常当控制流用，看到异常不等于就是 bug，要结合业务判断。"
        ],
        cppCode: "gdb ./prog\ncatch throw          # 异常抛出瞬间停下\nrun\nbt                   # 抛出点的完整调用栈\ninfo locals\n\n# 其他常用捕获点\ncatch catch          # 被捕获时停\nbreak abort          # assert 失败 / 未捕获异常最终落点\ncatch syscall write  # 特定系统调用\n",
        complexity: [
          "这个技巧的价值在于把“事后看结果”变成“当场看原因”，对偶发异常特别有效。",
          "延伸可以讲 noexcept 违约会直接 terminate，此时也是走 abort 路径。"
        ]
      }),
      q("debug-tool-gdb-logging", "advanced", false, "生产上不方便改代码重编译，怎么临时加日志？", ["gdb", "commands", "批处理"], [
        "gdb 的 commands 块可以让断点命中后自动执行一串命令，相当于不改代码就插了一行日志。",
        "典型写法是 silent 关掉噪音、printf 打印关心的字段、最后 continue 自动放行，程序几乎照常跑。",
        "配合 -batch 模式还能把整个分析脚本化，比如崩溃后自动导出所有线程栈，放进事故自动分析流程。",
        "需要注意每次命中都要在 gdb 里求值和格式化，高频路径上开销很大，只适合低频事件。",
        "更轻量的生产方案是 eBPF 系工具（bpftrace/bcc）或 SystemTap，它们的开销比 ptrace 低得多。"
      ], {
        diagramSteps: [
          "先在目标函数上下断点，确认能命中。",
          "输入 commands 进入命令块编辑模式，gdb 会提示后续输入的命令在命中时执行。",
          "第一行写 silent，避免每次都打印一大段断点信息。",
          "中间写 printf 或 p，把想看的变量输出出来。",
          "最后一行写 continue，让程序自动继续，不需要人工敲。",
          "输入 end 结束定义，之后 run 或 continue 即可自动收集日志。"
        ],
        pitfalls: [
          "命中频率高时会严重拖慢程序，生产上要先估算调用量。",
          "printf 的格式串和参数类型不匹配会导致 gdb 报错甚至中断收集。",
          "attach 期间进程是被暂停的，长时间挂着会影响线上服务。",
          "忘记写 continue 会让程序停住不动，看起来像卡死。"
        ],
        cppCode: "break handleOrder\ncommands\n  silent\n  printf \"id=%d price=%f\\n\", order.id, order.price\n  continue\nend\n\n# 脚本化：崩溃后自动导出全部线程栈\n# gdb -batch -ex \"thread apply all bt full\" -ex quit ./prog core > crash.txt\n",
        complexity: [
          "这是“不重启、不发版”就能拿到现场信息的手段，在不允许随意重启的交易系统里很实用。",
          "回答时最好补一句风险控制：先在预发验证开销，再决定是否上生产。"
        ]
      }),
      q("debug-tool-asan", "intermediate", true, "AddressSanitizer 能查什么？和普通调试有什么本质区别？", ["ASan", "内存越界", "sanitizer"], [
        "ASan 是编译期插桩：在每次内存读写前后插入检查代码，并在每块分配的内存周围放上“红区”哨兵。",
        "它能抓堆/栈/全局越界、use-after-free、double free，以及程序退出时的内存泄漏。",
        "和 gdb 最本质的区别是抓的时机：越界写通常不会当场崩，而是很久以后在别处崩，gdb 看到的现场已经不是案发现场；ASan 是当场抓现行。",
        "报告里会同时给出三处栈：出事的位置、这块内存在哪里分配、又在哪里被释放，基本可以直接定位。",
        "代价是速度慢约 2 倍、内存约 3 倍，所以适合开发和 CI 常开，不适合直接上生产主链路。"
      ], {
        diagramSteps: [
          "编译时加 -fsanitize=address -g -O1 -fno-omit-frame-pointer，让编译器插桩并保留调用栈。",
          "运行时 ASan 会接管 malloc/free，在每块内存前后额外留出红区。",
          "程序每次读写内存前，插桩代码先查影子内存判断这个地址是否合法。",
          "一旦读写落到红区或已释放区域，立即打印报告并终止。",
          "报告的第一段是出错类型和位置，第二段是这块内存的分配栈，第三段是释放栈。",
          "按这三处栈回到代码，通常几分钟内就能确认是谁越界或谁提前释放了。"
        ],
        pitfalls: [
          "ASan 和 TSan 不能同时开启，内存模型冲突，必须分两次跑。",
          "用 -O0 会非常慢，推荐 -O1，既保留可读栈又不至于太慢。",
          "内存放大 3 倍，内存本来就吃紧的服务可能直接跑不起来。",
          "它只能发现实际执行到的路径，跑一遍没报错不等于代码没问题，要配合覆盖较全的用例。"
        ],
        cppCode: "g++ -g -O1 -fno-omit-frame-pointer -fsanitize=address main.cpp\n./a.out\n\n# 运行期开关\n# ASAN_OPTIONS=detect_leaks=1:halt_on_error=0:log_path=./asan ./a.out\n\n# 典型报告结构：\n#   ERROR: AddressSanitizer: heap-buffer-overflow\n#   WRITE of size 4 at 0x... thread T0\n#     #0 appendOrder() order.cpp:88     <- 出事的地方\n#   allocated by thread T0 here: ...    <- 这块内存哪儿分配的\n#   freed by thread T0 here: ...        <- 又是在哪儿释放的\n",
        complexity: [
          "面试里常和 valgrind 一起被问，关键差异是要不要重新编译、能不能查栈上越界、速度差多少。",
          "可以补一句工程实践：CI 里跑一条 ASan 流水线，比事后查 core 划算得多。"
        ]
      }),
      q("debug-tool-tsan", "advanced", false, "怎么发现代码里的数据竞争？ThreadSanitizer 怎么用？", ["TSan", "数据竞争", "并发"], [
        "数据竞争靠人眼几乎查不出来，因为它只在特定的线程交织下才暴露，测试环境常年不复现。",
        "TSan 用 -fsanitize=thread 开启，原理是记录每次内存访问的线程和锁的持有状态，用 happens-before 关系判断两次访问之间有没有正确同步。",
        "报告会直接给出两个冲突访问的调用栈，以及各自持有的锁，非常直观。",
        "代价很大：慢 5 到 15 倍、内存涨 5 到 10 倍，所以一般只在 CI 或专门的压测环境里跑。",
        "关键限制是它只能发现实际执行到的竞争，所以要配合高并发压力测试和多次运行，跑一遍干净不等于没问题。"
      ], {
        diagramSteps: [
          "用 -fsanitize=thread -g -O1 单独编译一份二进制，注意不能和 ASan 混编。",
          "跑覆盖多线程路径的用例，最好加大并发和运行时长，增加交织出现的概率。",
          "TSan 在运行时为每块内存维护最近的访问记录和当时的同步状态。",
          "当发现两次访问同一地址、至少一次是写、且它们之间没有 happens-before 关系时，判定为竞争。",
          "报告中给出两处栈和各自的锁集合，对照代码就能看出漏加了哪把锁。",
          "修复后重跑，并把这条用例固化进 CI，防止回归。"
        ],
        pitfalls: [
          "误以为加了 volatile 就线程安全，volatile 不提供原子性也不提供内存序，TSan 照样报。",
          "自己写的无锁结构 TSan 可能误报，需要用 annotation 显式告诉它同步语义。",
          "开销太大导致时序完全改变，某些竞争反而不出现了，所以要多跑几轮。",
          "只跑单元测试不跑并发压测，等于没用，因为竞争需要真实交织才会触发。"
        ],
        cppCode: "g++ -g -O1 -fsanitize=thread main.cpp\nTSAN_OPTIONS=second_deadlock_stack=1 ./a.out\n\n# 典型报告：\n#   WARNING: ThreadSanitizer: data race\n#   Write of size 8 by thread T2:\n#     #0 OrderBook::insert() book.cpp:57\n#   Previous read of size 8 by thread T1:\n#     #0 OrderBook::snapshot() book.cpp:91\n#   Mutex M1 acquired by T1 but not by T2   <- 漏加锁的证据\n",
        complexity: [
          "TSan 属于“找得到就赚到”的工具，找不到不代表安全，这点面试时说清楚会显得很扎实。",
          "可以顺带讲数据竞争和竞态条件的区别：前者是内存层面的未定义行为，后者是逻辑层面依赖时序。"
        ]
      }),
      q("debug-tool-valgrind", "intermediate", true, "valgrind 和 Sanitizer 怎么选？memcheck 的报告怎么读？", ["valgrind", "memcheck", "内存泄漏"], [
        "最大差别是要不要重新编译：valgrind 直接拿现成二进制就能跑，Sanitizer 必须重编，这决定了各自的适用场景。",
        "valgrind 的原理是把程序放进一个虚拟 CPU 里逐条翻译执行，所以不用插桩但很慢，通常慢 10 到 50 倍。",
        "能力上各有长短：valgrind 的 memcheck 能查未初始化变量，这是 ASan 查不了的；但 ASan 能查栈上越界，valgrind 查不到。",
        "memcheck 的泄漏报告分四类，definitely lost 必须修，indirectly lost 修父节点即可，possibly lost 看情况，still reachable 通常可以忽略。",
        "结论是：开发和 CI 阶段常开 Sanitizer；只有二进制、不能重编时用 valgrind。"
      ], {
        diagramSteps: [
          "先确认能不能重新编译，这一步直接决定选哪个工具。",
          "选 valgrind 时加上 --leak-check=full --show-leak-kinds=all --track-origins=yes，信息最全。",
          "--track-origins 会告诉你未初始化的值是从哪来的，多花的时间很值。",
          "跑完先看 definitely lost，这些是真正没有任何指针指向的泄漏。",
          "still reachable 常常来自全局单例和内存池，程序退出时还被指着，一般不用管。",
          "查内存持续增长换 massif 子工具，它能画出内存随时间的曲线和各处占比。"
        ],
        pitfalls: [
          "把 still reachable 当泄漏去修，浪费大量时间在单例和内存池上。",
          "在慢 50 倍的环境下跑带超时的服务，会因为超时触发完全不同的代码路径。",
          "自定义内存池会让 memcheck 失去追踪能力，需要用 valgrind 的客户端请求宏做标注。",
          "helgrind 对无锁代码误报率较高，看到报告要先确认是不是真问题。"
        ],
        cppCode: "# 查泄漏（最常用的一条）\nvalgrind --leak-check=full --show-leak-kinds=all \\\n         --track-origins=yes --log-file=vg.log ./prog\n\n# 查内存增长是谁占的\nvalgrind --tool=massif ./prog\nms_print massif.out.1234\n\n# 查数据竞争\nvalgrind --tool=helgrind ./prog\n",
        complexity: [
          "选型题在面试里出现频率很高，回答时按“要不要重编译、速度、能查什么”三个维度对比最清楚。",
          "补一句实践结论会加分：日常靠 Sanitizer，救场靠 valgrind。"
        ]
      }),
      q("debug-tool-perf-stat", "intermediate", true, "perf stat 输出的 IPC、cache-misses 怎么解读？", ["perf", "IPC", "cache"], [
        "perf 是采样而不是插桩，开销只有几个百分点，可以直接在生产上用，这是它相对 valgrind 的最大优势。",
        "perf stat 不改代码、几秒出结果，适合作为性能排查的第一步，先看整体健康度再决定往哪个方向深挖。",
        "IPC（每周期指令数）是最重要的指标：大于 1.5 算健康，小于 1 说明 CPU 大量时间在等内存，问题多半出在数据布局而不是算法。",
        "cache-misses 占 cache-references 超过 5% 说明数据不连续或结构体太大，可能还有伪共享；branch-misses 超过 2% 说明分支不可预测。",
        "context-switches 高说明锁竞争激烈或线程开太多；page-faults 在启动后仍持续增长，说明内存一直在新分配或缺页没预热。"
      ], {
        diagramSteps: [
          "先跑 perf stat ./prog 拿到一组基线数字，注意要在有代表性的负载下测。",
          "看 IPC：低于 1 就先怀疑访存，去看数据结构是不是连续、有没有伪共享。",
          "看 cache-miss 率：高就检查结构体大小、成员排列、是否该用 vector 替代 list。",
          "看 context-switches：高就去查锁竞争，配合 strace 看 futex 调用量。",
          "确认是 CPU 密集后，用 perf record -g 抓一段，再用 perf report 或火焰图定位到具体函数。",
          "改动之后用同样的命令重测，对比同一组指标，避免凭感觉判断是否变快。"
        ],
        pitfalls: [
          "不加 -fno-omit-frame-pointer 就抓不到完整调用栈，火焰图会是断的。",
          "在没有代表性负载的空转状态下测，数字毫无意义。",
          "只看 CPU 时间不看等待时间，慢但 CPU 不高的问题会被完全漏掉。",
          "容器或虚拟机里某些硬件计数器不可用，需要确认 perf 事件是否真的被采集到。"
        ],
        cppCode: "# 第一步：整体健康度\nperf stat ./prog\n\n# 第二步：实时热点（像 top，但看的是函数）\nperf top -p <pid>\n\n# 第三步：抓一段做详细分析\nperf record -F 99 -g -p <pid> -- sleep 30\nperf report\n",
        complexity: [
          "把 IPC 和 cache-miss 讲清楚，能体现你对硬件层面的理解，而不只是会用工具。",
          "可以顺着讲到内存对齐、结构体成员排序和 cache 伪共享，这些都是降低 cache-miss 的具体手段。"
        ]
      }),
      q("debug-tool-flamegraph", "advanced", true, "火焰图怎么生成？怎么看？", ["火焰图", "perf", "性能分析"], [
        "生成流程是三步：perf record 采样、perf script 导出、FlameGraph 脚本折叠并画成 SVG。",
        "看图的规则很简单：横轴宽度代表占用 CPU 的比例，纵轴是调用深度而不是时间，颜色没有含义。",
        "重点找“最宽的平顶”，也就是又宽又没有子调用的那一块，那里就是真正在烧 CPU 的地方，是优化的第一目标。",
        "前提是编译时加了 -fno-omit-frame-pointer，否则调用栈是断的，图会显示成一堆孤立的短柱。",
        "除了 CPU 火焰图，还有 off-CPU 火焰图，专门看线程阻塞在哪里，适合排查“慢但 CPU 不高”的问题。"
      ], {
        diagramSteps: [
          "用 perf record -F 99 -g 抓样本，99 而不是 100 是为了避开与周期性任务同频共振。",
          "perf script 把二进制的采样数据导出成文本形式的调用栈。",
          "stackcollapse-perf.pl 把相同的调用栈合并计数，变成“栈;栈;栈 次数”的一行行数据。",
          "flamegraph.pl 把折叠后的数据画成 SVG，相同前缀的栈自动堆叠在一起。",
          "在浏览器里打开 SVG，可以点击任意方块下钻，也可以用搜索高亮某个函数。",
          "从上往下扫描，找最宽的平顶，那就是热点；如果热点在库函数里，往下看是谁调用的它。"
        ],
        pitfalls: [
          "误以为纵轴是时间轴，其实纵轴只是调用深度，横向顺序也只是字母序而非执行顺序。",
          "缺少 frame pointer 导致栈断裂，图上全是一层高的方块，等于白抓。",
          "采样时间太短，偶发热点采不到；建议至少抓 30 秒以上有代表性的负载。",
          "只做 CPU 火焰图，遇到 IO 或锁等待型的慢会一无所获，这时要做 off-CPU 火焰图。"
        ],
        cppCode: "git clone https://github.com/brendangregg/FlameGraph\n\nperf record -F 99 -g -p <pid> -- sleep 30\nperf script > out.perf\n./FlameGraph/stackcollapse-perf.pl out.perf > out.folded\n./FlameGraph/flamegraph.pl out.folded > flame.svg\n\n# 编译时务必带上：\n#   -g -fno-omit-frame-pointer\n",
        complexity: [
          "火焰图的价值是把几十万条采样压缩成一张能一眼看懂的图，是性能优化的通用起点。",
          "回答时可以补充：优化前后各出一张图对比，是最有说服力的成果展示方式。"
        ]
      }),
      q("debug-tool-strace", "intermediate", true, "strace 怎么用？看到进程卡在 futex 说明什么？", ["strace", "系统调用", "排障"], [
        "strace 相当于在程序和操作系统之间装了个窃听器，所有系统调用连同参数和返回值都被记录，程序可以骗你但系统调用不会。",
        "最有用的参数是 -T（显示每个调用的耗时）和 -f（跟踪子进程和线程），排查卡顿时这两个基本必加。",
        "看到长时间卡在 futex 上，说明在等锁，因为 pthread 的 mutex 和条件变量底层都是 futex。",
        "卡在 epoll_wait 或 poll 上是正常空闲；卡在 read/write 上说明 IO 慢或对端不回；大量 openat 返回 ENOENT 说明在到处找文件。",
        "代价是每个系统调用都要陷入 ptrace，程序会慢几十倍，生产上只能短时间使用，更轻量的替代是 bpftrace 这类 eBPF 工具。"
      ], {
        diagramSteps: [
          "先用 top 确认 CPU 占用低，符合“在等待”的特征，再决定用 strace。",
          "strace -f -T -tt -p <pid> 附加上去，观察几秒钟的调用序列。",
          "看反复出现或长时间停住的那个系统调用，它就是等待点。",
          "futex 表示等锁，接下来该转去看线程栈确认是哪把锁；read/write 表示等 IO，去查对端和磁盘。",
          "如果想要统计视角，用 strace -c 汇总，直接看哪个调用次数最多、总耗时最长。",
          "定位完立刻断开，不要长期挂着影响线上服务。"
        ],
        pitfalls: [
          "在延迟敏感的交易主链路上开 strace，可能直接把服务拖垮，属于二次事故。",
          "只看调用名不看返回值，会漏掉 EACCES、ENOENT 这类一眼能定位的错误。",
          "不加 -f 时看不到线程和子进程的行为，多线程服务基本等于没看。",
          "把 epoll_wait 上的等待误判成卡死，那其实是正常的空闲状态。"
        ],
        cppCode: "# 跟踪运行中的进程，显示耗时和时间戳\nstrace -f -T -tt -p <pid>\n\n# 汇总统计：哪个系统调用最多/最慢\nstrace -c ./prog\n\n# 只看某一类\nstrace -e trace=openat ./prog    # 找配置文件在哪\nstrace -e trace=network ./prog   # 只看网络\n\n# 判读：futex = 等锁；epoll_wait = 正常空闲；\n#       大量 brk/mmap = 频繁申请内存，考虑内存池\n",
        complexity: [
          "strace 的定位是“定性”工具：先确认时间花在哪一类等待上，再换更精确的工具深入。",
          "面试里常和 perf 一起问，区别是 strace 看系统调用轨迹，perf 看 CPU 热点采样。"
        ]
      }),
      q("debug-tool-build-flags", "basic", true, "为了以后好排查，编译选项该怎么配？", ["编译选项", "调试符号", "frame pointer"], [
        "最重要的一条：Release 也要带 -g。调试符号不影响运行速度，只是二进制变大，但没有它 core 文件基本没用。",
        "不要 strip；如果介意体积，用 objcopy --only-keep-debug 把符号单独抽出来归档，线上放精简版，出事时再配对分析。",
        "第二条是加 -fno-omit-frame-pointer，只损失约 1% 性能，却是 perf 火焰图和完整调用栈的前提。",
        "日常开发构建推荐 -Og -g -Wall -Wextra 再叠加 -fsanitize=address,undefined，把问题拦在开发阶段。",
        "调试构建还可以加 -D_GLIBCXX_ASSERTIONS 打开 STL 的轻量边界检查，比 -D_GLIBCXX_DEBUG 温和且不破坏 ABI。"
      ], {
        diagramSteps: [
          "先区分三种构建：日常开发、CI 检查、线上发布，它们的选项目标不同。",
          "开发构建追求“早发现”，用 -Og 保证可调试，叠加 ASan 和 UBSan。",
          "CI 额外单独跑一条 TSan 流水线，因为它不能和 ASan 混编。",
          "发布构建追求性能，用 -O2 -DNDEBUG，但必须保留 -g 和 frame pointer。",
          "构建产物同时归档一份带完整符号的版本，和线上版本一一对应。",
          "线上崩溃后，用归档的符号文件配合 core 分析，或用 addr2line 把地址翻回行号。"
        ],
        pitfalls: [
          "为了减小体积而 strip 掉符号，出事后 core 里全是 ?? ，等于白留。",
          "符号文件和线上二进制版本对不上，栈会显示成完全错误的函数名，比没有还危险。",
          "-D_GLIBCXX_DEBUG 会改变 STL 的 ABI，混用会导致诡异崩溃，只能整个项目统一开。",
          "在 Release 上开 Sanitizer 直接上线，性能和内存都扛不住。"
        ],
        cppCode: "# 日常开发\ng++ -Og -g -Wall -Wextra -fno-omit-frame-pointer \\\n    -fsanitize=address,undefined -D_GLIBCXX_ASSERTIONS main.cpp\n\n# CI 额外单独跑一次（不能和 ASan 混）\ng++ -O1 -g -fsanitize=thread main.cpp\n\n# 线上发布：保留 -g，不要 strip\ng++ -O2 -g -DNDEBUG -fno-omit-frame-pointer main.cpp\n\n# 符号单独归档\nobjcopy --only-keep-debug prog prog.debug\nobjcopy --strip-debug prog\nobjcopy --add-gnu-debuglink=prog.debug prog\n",
        complexity: [
          "这题看似基础，实际很能区分有没有真正处理过线上事故的人。",
          "回答时强调“可观测性要在编译期就设计好”，比事后补救有效得多。"
        ]
      })
    ],
    "性能优化": [
      q("perf-cpu-high", "basic", true, "CPU 飙高时你一般怎么排查？", ["CPU", "perf"], [
        "先定位是哪个进程、哪个线程最忙，再区分用户态还是系统态。",
        "然后用 perf、火焰图或采样工具看热点函数和调用链。",
        "最后把热点和业务现象对应起来，别停留在“某函数很热”这一层。"
      ]),
      q("perf-memory-growth", "basic", true, "内存持续上涨时如何判断是泄漏、缓存还是碎片？", ["内存上涨"], [
        "先看 RSS、匿名页、映射文件、堆使用等不同维度，不要只看一个总数。",
        "如果业务高峰后会回落，更像缓存或工作集变化；完全不回落更要警惕泄漏。",
        "结合 profile 工具、对象计数和流量变化才能做出靠谱判断。"
      ]),
      q("perf-flame-graph", "intermediate", true, "火焰图主要帮助你看什么？", ["火焰图"], [
        "火焰图直观展示采样时间主要消耗在哪些函数调用栈上。",
        "它特别适合找热点路径，而不是替代所有类型的性能分析。",
        "拿到火焰图后还要结合场景理解“为什么热”，而不只是“哪里热”。"
      ]),
      q("perf-lock-contention", "intermediate", true, "如何减少锁竞争？", ["锁竞争"], [
        "优先从架构上分片共享状态，让不同线程少碰同一把锁。",
        "缩小临界区，把重计算搬到锁外执行。",
        "必要时再考虑读写锁、无锁结构或批量提交，但要评估复杂度。"
      ]),
      q("perf-cache-locality", "intermediate", false, "为什么缓存局部性会影响性能？", ["cache locality"], [
        "CPU 访问连续内存时更容易命中 cache，随机访问会放大访存延迟。",
        "这也是为什么 vector 常比链表更快，即便两者理论复杂度看起来差不多。",
        "很多性能优化最终落回到数据布局和访问模式。"
      ]),
      q("perf-zero-copy", "advanced", true, "零拷贝在高性能系统中有什么意义？", ["zero-copy"], [
        "零拷贝减少 CPU 在缓冲区之间搬运数据的次数，降低时延和缓存污染。",
        "它在网络、日志、媒体和共享内存场景都很常见。",
        "但零拷贝通常会让缓冲区生命周期管理变复杂，需要更清晰的 ownership 设计。"
      ]),
      q("perf-batching", "intermediate", false, "批处理为什么经常能提高吞吐？代价是什么？", ["batching"], [
        "批处理能摊薄系统调用、锁获取和调度开销，因此常提升吞吐。",
        "代价通常是单个请求等待更久，尾时延可能变差。",
        "所以它本质上是吞吐和时延之间的经典权衡。"
      ]),
      q("perf-thread-pool", "intermediate", true, "线程池大小应该怎么考虑？", ["线程池"], [
        "要看任务类型是 CPU 密集还是 IO 密集，以及机器核数和阻塞比例。",
        "线程太少会吃不满资源，太多会增加切换、竞争和内存占用。",
        "比较成熟的回答是：先给经验值，再强调通过压测和监控校准。"
      ]),
      q("perf-sync-vs-async", "advanced", false, "同步模型和异步模型如何做性能层面的取舍？", ["同步", "异步"], [
        "异步不一定更快，它更多解决的是等待期间如何提高资源利用率。",
        "同步模型更直接、易调试，但在高 IO 等待场景下可能浪费线程。",
        "是否异步取决于复杂度、延迟目标、错误处理和团队维护能力。"
      ]),
      q("perf-numa", "advanced", false, "什么是 NUMA？为什么有些高性能系统要关心它？", ["NUMA"], [
        "NUMA 机器上不同 CPU 节点访问本地和远端内存的成本不同。",
        "如果线程、内存和设备亲和性混乱，时延和带宽表现会变差。",
        "这在大规模服务器、DPDK、通信和数据库场景里比较常见。"
      ]),
      q("perf-measurement", "basic", true, "做性能优化时为什么一定要先测基线？", ["基线", "profiling"], [
        "没有基线就无法判断问题是否真的存在，也无法量化收益。",
        "很多“优化”只是主观感觉更好，实际可能没有改进甚至更差。",
        "工程上要用数据说话，包括平均值、分位数、资源占用和副作用。"
      ])
    ],
    "通信与嵌入式专项": [
      q("comm-determinism", "intermediate", true, "通信系统里为什么常强调时延确定性，而不是只看平均吞吐？", ["实时性", "确定性"], [
        "很多无线或基带链路有严格时隙和截止时间，错过 deadline 比均值下降更致命。",
        "平均值掩盖不了尾时延和抖动风险，系统稳定性更看最坏情况。",
        "所以这类系统常用绑核、预分配和固定流水线减少不确定性。"
      ]),
      q("comm-ring-buffer", "intermediate", true, "为什么高性能报文处理里常见环形缓冲区？", ["ring buffer"], [
        "环形缓冲区内存布局简单、缓存友好，适合流式生产消费模型。",
        "它便于预分配容量，减少运行时 malloc 带来的抖动。",
        "但多生产者多消费者时，索引同步和覆盖策略会更复杂。"
      ]),
      q("comm-lock-reduction", "advanced", true, "多线程处理报文时，如何减少锁竞争？", ["锁竞争", "报文"], [
        "先按小区、端口、队列或流方向拆分状态，避免所有线程打到同一热点。",
        "再缩小临界区，把解析和计算搬到锁外。",
        "必要时才考虑无锁队列或 per-thread cache，并评估调试成本。"
      ]),
      q("comm-zero-copy", "advanced", true, "零拷贝在通信系统中为什么特别重要？", ["zero-copy", "DMA"], [
        "数据块大、频率高时，多一次拷贝就可能放大 CPU 消耗和尾时延。",
        "零拷贝还能减少缓存污染，让 CPU 更多时间用于真正的协议处理。",
        "但它通常要求更严格的缓冲区生命周期管理和 ownership 设计。"
      ]),
      q("comm-dma", "advanced", false, "DMA 在嵌入式或通信设备里常扮演什么角色？", ["DMA"], [
        "DMA 让数据传输尽量绕开 CPU 搬运，由专门硬件在内存和设备间传数据。",
        "这能释放 CPU 去做协议、调度和控制逻辑。",
        "但需要更谨慎地处理缓存一致性、对齐和同步时机。"
      ]),
      q("comm-interrupt-vs-polling", "intermediate", false, "中断驱动和轮询各有什么适用场景？", ["中断", "轮询"], [
        "低负载、事件稀疏时中断更省资源，响应也自然。",
        "高吞吐连续流量场景中，轮询有时更稳定，能减少中断风暴和切换开销。",
        "通信系统常会混合使用，关键是看负载特征和时延目标。"
      ]),
      q("comm-memory-pool", "intermediate", true, "为什么嵌入式系统常使用固定大小内存池？", ["内存池"], [
        "固定大小内存池可以降低碎片和动态分配抖动，提升时延稳定性。",
        "资源上限也更容易评估，适合内存受限或实时要求强的环境。",
        "代价是灵活性下降，需要更早规划容量和对象大小。"
      ]),
      q("comm-affinity", "advanced", false, "线程绑核在通信系统里通常是为了什么？", ["绑核"], [
        "核心目的是减少调度迁移带来的缓存失效和尾时延抖动。",
        "对固定流水线角色线程，如收包、解码、调度，绑核尤其常见。",
        "但绑核后也要注意负载均衡和故障场景，不然容易出现热点核。"
      ]),
      q("comm-packet-loss", "intermediate", true, "如果系统出现丢包和时延同时升高，你会先怀疑什么？", ["丢包", "时延"], [
        "先看接收队列是否拥塞、CPU 是否吃满、锁竞争是否严重。",
        "再看外部链路、驱动中断处理和上游流量是否异常放大。",
        "丢包和时延经常是同一个瓶颈的两个外在表现。"
      ]),
      q("comm-endian-protocol", "intermediate", false, "做协议解析时为什么字节序和对齐问题很重要？", ["字节序", "协议解析"], [
        "不同平台字节序不同，协议字段解析如果没统一转换会直接读错值。",
        "结构体强转解析还会踩到对齐和 padding 风险。",
        "所以可靠协议解析更倾向显式按字节读写，而不是依赖内存布局巧合。"
      ]),
      q("comm-state-machine", "intermediate", true, "为什么协议处理和设备控制常用状态机设计？", ["状态机"], [
        "状态机可以把复杂时序拆成明确状态和转移，更适合调试和验证。",
        "它尤其适合处理握手、超时、重试和错误恢复逻辑。",
        "面试里说清“状态机降低复杂控制流的隐性耦合”会很加分。"
      ])
    ],
    "项目深挖": [
      q("project-hard-bug", "intermediate", true, "项目里最难定位的一个 bug，你怎么组织答案？", ["项目", "bug"], [
        "建议按“现象、影响、假设、验证、根因、修复、预防”来讲。",
        "重点展示定位过程和判断依据，而不是只强调你很辛苦。",
        "最后补上防回归手段，如测试、监控、告警或设计调整。"
      ]),
      q("project-performance", "intermediate", true, "面试官问你做过的性能优化时，怎样回答更有说服力？", ["性能优化"], [
        "先给基线和收益数据，例如 CPU、时延、吞吐的量化变化。",
        "再解释你是如何定位瓶颈、为什么判断这个方案有效。",
        "最后补充风险控制和验证方式，会更像真实工程案例。"
      ]),
      q("project-architecture", "intermediate", true, "如何把自己的项目架构讲得既清楚又不空泛？", ["架构"], [
        "先讲业务目标，再讲核心模块和数据流，不要一上来堆技术名词。",
        "重点说模块边界、关键依赖和你负责的部分。",
        "如果能补一两个关键取舍点，架构回答会更立体。"
      ]),
      q("project-responsibility", "basic", true, "面试时如何说清自己在项目中的真实职责？", ["职责"], [
        "把“参与过”拆成自己具体负责的模块、接口、问题和结果。",
        "能量化就量化，比如服务规模、吞吐、团队协作人数等。",
        "宁可范围小但真实，也不要把整个项目都说成自己主导。"
      ]),
      q("project-tradeoff", "intermediate", true, "如何讲一个你做过的技术取舍？", ["取舍"], [
        "先交代背景和约束，比如时延、开发周期、兼容性或团队能力。",
        "然后说明备选方案和你为什么最终选当前方案。",
        "最后要讲代价和后续补偿措施，而不是把决定说成完美无缺。"
      ]),
      q("project-refactor", "intermediate", false, "如果让你讲一次重构经历，重点该放在哪？", ["重构"], [
        "重点不是“代码更优雅了”，而是旧问题具体影响了什么。",
        "说明你怎么拆风险、保证兼容、验证收益。",
        "如果能展示重构前后维护成本或故障率变化，会更可信。"
      ]),
      q("project-online-issue", "intermediate", true, "线上故障你是如何响应和推进解决的？", ["线上故障"], [
        "先讲止血措施，再讲定位过程，最后讲长期修复。",
        "如果有跨团队协作，要说明你如何同步信息和推动决策。",
        "面试官更看重你在压力下的判断和协作，而不只是技术细节。"
      ]),
      q("project-testing", "intermediate", false, "如何说明你在项目中做过的测试和质量保障工作？", ["测试"], [
        "可以按单元测试、集成测试、压测、回归、监控告警分层来讲。",
        "重点说哪些测试真正帮你抓住过问题，而不是只说“我们有测试”。",
        "如果能把质量策略和业务风险联系起来，会更有说服力。"
      ]),
      q("project-collaboration", "basic", false, "跨团队协作经历怎么说才不空？", ["协作"], [
        "先说为什么要协作，是接口边界、资源争抢还是共同排障。",
        "再说你扮演的具体角色，例如协调、方案落地或信息桥接。",
        "最后给出结果和经验，而不是只说“沟通很重要”。"
      ]),
      q("project-failure", "intermediate", false, "如果项目里有失败经历，怎么回答更好？", ["失败经历"], [
        "不要回避失败，但要说明你如何识别问题并调整。",
        "把重点放在复盘、改进和下次如何避免，而不是甩锅。",
        "成熟的回答通常能体现自省和成长速度。"
      ]),
      q("project-depth", "advanced", true, "怎么让面试官相信你对项目是真懂而不是背稿？", ["项目深度"], [
        "回答时多讲因果关系和权衡，而不是只念架构名词和组件清单。",
        "能把一个问题从现象讲到根因，再讲到设计选择，深度就出来了。",
        "细节上保持真实，承认边界和不知道的部分，反而更可信。"
      ])
    ],
    "HR / 场景表达": [
      q("hr-self-intro", "basic", true, "如何做一个 1-2 分钟的自我介绍？", ["自我介绍"], [
        "结构上建议按背景、核心经历、优势方向、为什么适合这份岗位来讲。",
        "内容要围绕岗位相关性，而不是从学校到现在流水账。",
        "好的自我介绍应该自然引出你最想让面试官追问的项目。"
      ]),
      q("hr-job-change", "basic", true, "为什么想换工作？这个问题怎么回答更稳妥？", ["换工作"], [
        "尽量从成长空间、技术方向、业务匹配度来讲，而不是抱怨前公司。",
        "把动机说成“寻找更适合自己的平台”，比情绪化表达更成熟。",
        "同时要让对方感觉你是积极选择，而不是被动逃离。"
      ]),
      q("hr-strength-weakness", "basic", true, "优点和缺点怎么回答才不套路？", ["优点", "缺点"], [
        "优点最好配具体例子，说明它怎样在项目里产生了实际价值。",
        "缺点不要说致命岗位短板，也别说听起来像优点的假缺点。",
        "好的缺点回答通常包含你已经在做的改进动作。"
      ]),
      q("hr-conflict", "intermediate", false, "和同事意见不一致时你通常怎么处理？", ["冲突处理"], [
        "先把争论转成目标和证据，而不是只拼资历或语气。",
        "如果能用数据、实验或小规模试点验证，往往比继续争更有效。",
        "最终要体现的是协作推进问题，而不是赢得争论。"
      ]),
      q("hr-pressure", "basic", true, "deadline 很紧、压力很大时你怎么处理？", ["压力"], [
        "先分优先级和风险，明确必须交付的核心目标。",
        "及时同步风险和依赖，不要等到临近截止才暴露问题。",
        "真正成熟的回答是“有节奏地推进并管理预期”，而不是单纯熬夜。"
      ]),
      q("hr-learning", "basic", false, "如果遇到没做过的新技术，你通常如何快速上手？", ["学习能力"], [
        "先抓住它解决的问题、核心概念和最小可运行路径。",
        "通过官方文档、最小 Demo 和现有项目代码建立第一轮理解。",
        "再结合具体需求做针对性深入，而不是一上来大而全地啃。"
      ]),
      q("hr-code-review", "intermediate", false, "代码评审里遇到你不认同的意见怎么办？", ["code review"], [
        "先确认对方关注的是正确性、风格、性能还是长期维护性。",
        "如果有分歧，尽量拿事实、文档或实验结果说话，而不是硬顶。",
        "必要时可以升级讨论，但目标始终是让代码更好，不是争输赢。"
      ]),
      q("hr-why-us", "basic", true, "为什么想来我们这家公司或团队？", ["为什么加入"], [
        "把回答落到岗位方向、业务场景、技术挑战和你的经历匹配度上。",
        "说明你做过功课，而不是泛泛说平台大、机会多。",
        "最有说服力的是讲清“这里正好是我下一阶段最想做的事”。"
      ]),
      q("hr-career-plan", "basic", false, "未来 3-5 年的职业规划怎么回答？", ["职业规划"], [
        "方向上要和岗位匹配，比如从模块负责走向系统级能力和技术影响力。",
        "既要有成长目标，也不要说得脱离实际或太空泛。",
        "让面试官看到你愿意长期投入，而不是只把这份工作当跳板。"
      ]),
      q("hr-unknown-answer", "basic", true, "如果被问到不会的问题，怎么应对更好？", ["不会的问题"], [
        "先诚实承认边界，不要强行编答案。",
        "再尝试基于已知知识给出推理路径，展示分析能力。",
        "面试官通常更介意不诚实，而不是你真的有知识盲区。"
      ]),
      q("hr-salary", "basic", false, "谈薪时怎么表达更专业？", ["谈薪"], [
        "先确认岗位范围、职责和整体 package，再给出合理预期。",
        "表达可以坚定，但不要只给一个情绪化数字。",
        "更稳妥的方式是强调价值匹配、市场区间和长期合作意愿。"
      ])
    ],
    "广立微 / C++ 岗": [
      q("glw-cpp-pointer-reference", "basic", true, "指针和引用有什么区别？", ["广立微", "C++", "指针", "引用"], [
        "指针本质上是一个保存地址的变量，可以为空，也可以在运行时改成指向别的对象；引用更像已有对象的别名，定义时通常必须初始化。",
        "语法上使用指针通常要显式解引用，还要考虑空指针判断；引用在使用体验上更接近普通变量。",
        "语义上引用更适合表达“这个对象一定存在”，指针更适合表达“这个参数可能为空”或者“这里涉及所有权/资源转移”。",
        "如果是面试里的工程回答，最好补一句：现代 C++ 更强调用引用、智能指针和明确的接口语义，而不是大量裸指针。"
      ]),
      q("glw-cpp-new-delete", "basic", true, "new/delete 和 malloc/free 的区别是什么？", ["C++", "new", "malloc"], [
        "malloc/free 是 C 时代的内存分配接口，只负责申请和释放一块原始内存，不会调用对象的构造函数和析构函数。",
        "new/delete 是 C++ 运算符，除了分配内存，还会完成对象构造和析构，所以更适合管理类对象。",
        "失败语义也不同，malloc 失败通常返回空指针，new 默认会抛异常。",
        "面试里最好再补一句：真实工程里更推荐用 vector、string、unique_ptr 这类 RAII 类型，尽量少直接写 new/delete。"
      ]),
      q("glw-cpp-virtual", "intermediate", true, "虚函数的作用是什么？多态一般怎么实现？", ["虚函数", "多态"], [
        "虚函数的核心作用是实现运行时多态，也就是通过基类指针或引用调用接口时，实际执行哪个函数由对象的真实类型决定。",
        "底层一般可以理解为对象里有一个虚表指针，类里维护虚函数表，运行时通过这层间接跳转完成动态分派。",
        "它的价值不是语法炫技，而是接口解耦，例如统一的基类接口可以挂接不同的具体实现。",
        "如果继续往下答，可以补充虚函数会带来一点对象大小和调用开销，但多数工程场景更看重扩展性和可维护性。"
      ]),
      q("glw-cpp-copy-move", "intermediate", true, "拷贝构造、移动构造分别在什么场景触发？", ["拷贝构造", "移动构造"], [
        "当对象按值传参、按值返回、用一个已有对象初始化另一个对象时，都可能触发拷贝构造或移动构造。",
        "如果源对象是右值，或者你显式使用 std::move 把它转成右值引用，编译器更倾向选择移动构造。",
        "移动构造的核心不是复制数据，而是把底层资源所有权转过去，比如把 buffer 指针、容量等元数据搬给新对象。",
        "这类题真正想考的是你是否理解资源管理：资源型类如果没处理好拷贝和移动，轻则性能差，重则重复释放。"
      ]),
      q("glw-cpp-deep-shallow", "basic", true, "深拷贝和浅拷贝有什么区别？", ["深拷贝", "浅拷贝"], [
        "浅拷贝只复制成员值本身，如果成员里保存的是地址或句柄，那么两个对象可能指向同一份底层资源。",
        "这样虽然表面上复制成功了，但后续只要一个对象修改或释放资源，另一个对象就可能受到影响，甚至出现重复释放。",
        "深拷贝会重新申请资源，再把原对象里的内容复制过去，让新旧对象各自拥有独立资源。",
        "所以只要类自己管理堆内存、文件句柄、socket 之类资源，就不能只依赖默认拷贝行为。"
      ]),
      q("glw-cpp-smart-ptr", "intermediate", true, "shared_ptr、unique_ptr、weak_ptr 的区别是什么？", ["智能指针", "shared_ptr", "unique_ptr", "weak_ptr"], [
        "unique_ptr 表示独占所有权，同一时刻只能有一个所有者，语义最清晰、开销也最小，所以通常应该优先考虑它。",
        "shared_ptr 通过引用计数共享对象生命周期，适合确实存在多个模块共同持有同一对象的场景。",
        "weak_ptr 不参与对象所有权，只是弱引用观察者，典型用途是打破 shared_ptr 之间的循环引用。",
        "答题时最好强调：shared_ptr 不是默认选择，它的价值在共享生命周期，而不是“用起来方便”。"
      ]),
      q("glw-cpp-memory-leak", "intermediate", true, "什么情况下会发生内存泄漏？你一般怎么排查？", ["内存泄漏", "排查"], [
        "最常见的原因包括申请了堆内存但没有释放、异常路径提前 return 导致清理逻辑没走到、shared_ptr 循环引用、容器长期持有对象等。",
        "排查时我通常先看现象，是 RSS 持续上涨、峰值后不回落，还是只在特定流量下增长，这能先区分泄漏和缓存增长。",
        "然后再结合对象生命周期去找怀疑点，用 ASan、Valgrind、对象计数日志或者模块级开关逐步缩小范围。",
        "好的回答不要只背工具名，而要体现你有“先判断类型，再定位范围，最后验证修复”的排查路径。"
      ]),
      q("glw-cpp-vector-map", "basic", true, "vector 扩容时会发生什么？map 和 unordered_map 又该怎么选？", ["vector", "map", "unordered_map"], [
        "vector 底层是连续内存，当容量不够时会重新申请更大的内存，然后把原来的元素搬过去，再释放旧内存。",
        "所以一旦发生扩容，原有的迭代器、引用、指针很可能都会失效，这是实际工程里很常见的坑。",
        "map 一般基于红黑树，元素天然有序，适合范围查询和有序遍历；unordered_map 一般基于哈希表，平均查找更快。",
        "真正选型时不要只说复杂度，还要说是否需要稳定顺序、范围操作、内存开销和最坏情况表现。"
      ]),
      q("glw-cpp-threadsafe", "intermediate", true, "线程安全和可重入有什么区别？", ["线程安全", "可重入"], [
        "线程安全强调多个线程同时调用某个函数或对象接口时，最终结果仍然正确，通常可以通过锁、原子变量等同步方式实现。",
        "可重入比线程安全更严格，它要求函数在执行过程中即使被信号中断后再次进入，也不会依赖共享可变状态。",
        "一个函数可以通过加锁做到线程安全，但因为内部用了静态变量或全局状态，它仍然可能不是可重入的。",
        "面试里如果能举出“线程安全不一定可重入”的反例，通常会比只背定义更有说服力。"
      ]),
      q("glw-cpp-cpu-memory", "intermediate", true, "如果一个 C++ 服务 CPU 高或者内存持续上涨，你通常怎么定位？", ["CPU 高", "内存上涨", "排查"], [
        "如果 CPU 高，我会先看是哪个进程、哪个线程最忙，再用 perf、火焰图或日志判断是忙循环、锁竞争、异常重试还是系统调用过多。",
        "如果内存上涨，我会先区分是泄漏、缓存增长、工作集扩大还是碎片问题，而不是看到曲线上升就直接说泄漏。",
        "接着再结合版本变更、流量变化和模块边界做局部定位，必要时加对象计数或模块级开关做二分。",
        "这道题的关键不是列很多命令，而是体现你有结构化排障思路，知道先定性再定点。"
      ]),
      q("glw-cpp-virtual-destructor", "intermediate", true, "为什么多态基类的析构函数通常要声明为 virtual？", ["虚析构", "多态基类"], [
        "如果一个类会被当作多态基类使用，就很可能通过基类指针去释放派生类对象。",
        "这时如果基类析构函数不是 virtual，delete 基类指针时只会执行基类析构，派生类资源就可能泄漏。",
        "把析构函数声明为 virtual，才能保证析构过程按照真实对象类型正确地从派生类往基类链路执行。",
        "所以更准确的说法不是“所有类析构都要 virtual”，而是“会被多态删除的基类析构应该是 virtual”。"
      ]),
      q("glw-cpp-raii", "intermediate", true, "什么是 RAII？为什么它在 C++ 工程里很重要？", ["RAII", "资源管理"], [
        "RAII 的核心思想是把资源生命周期绑定到对象生命周期，构造时拿资源，析构时自动释放资源。",
        "这样即使函数中途 return 或抛异常，资源也能靠析构自动清理，不容易遗漏。",
        "它不只适用于内存，也适用于锁、文件句柄、socket、线程 join 这类广义资源。",
        "现代 C++ 很多好用的标准库类型本质上都在贯彻 RAII，这也是为什么工程里要尽量少写手动释放逻辑。"
      ]),
      q("glw-cpp-move-forward", "advanced", true, "std::move 和 std::forward 的区别是什么？", ["std::move", "std::forward", "完美转发"], [
        "std::move 本质上是一个强制类型转换，把表达式显式转成右值，告诉编译器这个对象的资源可以被移动。",
        "std::forward 主要用在模板里，它会根据实参原本的值类别决定是按左值还是右值继续转发。",
        "所以 move 是无条件“右值化”，forward 是“按原样转发”，两者语义不同。",
        "如果不是在转发引用场景里，滥用 forward 通常没有意义，这一点面试里说出来会比较加分。"
      ]),
      q("glw-cpp-lambda", "intermediate", true, "lambda 捕获方式有哪些？最常见的坑是什么？", ["lambda", "捕获", "生命周期"], [
        "常见捕获方式有值捕获、引用捕获、按 this 捕获以及显式列出部分变量混合捕获。",
        "最常见的坑是异步场景里引用捕获了局部变量，等回调真正执行时，被捕获对象已经失效了。",
        "另一个常见问题是误用 this 捕获，导致对象已经析构但回调还在访问成员。",
        "如果结合线程池、定时器、事件回调这类场景来回答，会比单纯列语法更像真实开发经验。"
      ]),
      q("glw-cpp-rule-of-five", "advanced", true, "什么是 Rule of Three / Five？什么时候需要自己实现这些函数？", ["Rule of Five", "资源管理"], [
        "经典的 Rule of Three 指的是如果类需要自定义析构函数、拷贝构造、拷贝赋值中的一个，通常另外两个也要认真考虑。",
        "到了现代 C++，因为引入了移动构造和移动赋值，实践上更常说 Rule of Five。",
        "真正需要自己实现这些函数的典型场景，是类直接管理裸资源，比如堆内存、文件句柄、socket 等。",
        "如果资源已经交给 string、vector、unique_ptr 这类成员管理，很多时候恰恰应该尽量依赖编译器默认生成，而不是自己硬写。"
      ])
    ],
    "广立微 / 测试开发岗": [
      q("glw-test-role-diff", "basic", true, "你理解的测试开发和功能测试有什么区别？", ["测试开发", "功能测试"], [
        "功能测试更偏验证业务是否符合预期，测试开发更强调自动化平台、测试工具和效率建设。",
        "测试开发的核心价值不只是发现问题，还要降低回归成本、提高定位效率和稳定性。",
        "如果能结合平台化、脚本化和数据分析能力一起回答，会更符合岗位预期。"
      ]),
      q("glw-test-framework", "intermediate", true, "怎么设计一个自动化测试框架？", ["自动化测试", "测试框架"], [
        "通常分成用例层、业务封装层、驱动层、数据层和报告层，尽量降低耦合。",
        "同时要考虑环境管理、日志、失败重试、测试数据准备和结果归档。",
        "设计重点不是堆功能，而是长期可维护、可扩展、可定位问题。"
      ]),
      q("glw-test-stability", "intermediate", true, "如何保证自动化用例稳定，而不是反复 flaky？", ["稳定性", "flaky"], [
        "先减少环境依赖和共享数据污染，再避免硬编码等待和脆弱断言。",
        "高频失败的用例要区分环境问题、产品缺陷和脚本问题，不能只靠重跑掩盖。",
        "真正稳定的自动化依赖隔离、可观测性和明确的失败归因。"
      ]),
      q("glw-test-incident", "intermediate", true, "线上或测试环境出现偶现问题，很难复现时你怎么处理？", ["偶现问题", "复现"], [
        "先收集版本、时间、输入、日志和环境信息，明确最小可疑条件集合。",
        "然后补关键路径日志或监控，把问题从完全偶发变成可观察。",
        "再通过缩小变量和构造最小复现场景逐步逼近根因。"
      ]),
      q("glw-test-quality", "basic", true, "你怎么衡量测试质量，而不只是统计执行了多少用例？", ["测试质量", "覆盖率"], [
        "更有价值的指标是关键路径覆盖率、缺陷发现效率、自动化覆盖率、回归耗时和线上漏测率。",
        "单纯的用例数量往往只能反映工作量，不能反映风险控制效果。",
        "好的回答应该体现你知道质量指标必须服务业务风险。"
      ]),
      q("glw-test-interface", "basic", true, "接口测试除了主流程，还应该重点看什么？", ["接口测试", "边界值"], [
        "重点看异常分支、边界值、幂等性、权限校验、并发下的一致性和错误码语义。",
        "很多缺陷不是主流程挂了，而是异常输入或重复请求场景设计不完整。",
        "如果系统涉及数据分析，还要关注结果一致性和统计口径正确性。"
      ]),
      q("glw-test-log-platform", "intermediate", true, "如果让你测试一个日志分析平台，你会怎么拆测试点？", ["日志分析", "平台测试"], [
        "先验证导入、过滤、统计和展示的功能正确性，再看大数据量下的性能和稳定性。",
        "然后补异常数据容错、重复导入一致性和组合筛选正确性等边界场景。",
        "这类题关键在于你能把功能、性能、稳定性和数据正确性一起考虑。"
      ]),
      q("glw-test-why-important", "basic", true, "像广立微这类公司为什么会比较看重测试开发？", ["广立微", "测试开发", "EDA"], [
        "这类软件往往和芯片测试数据、工程流程和效率工具相关，场景复杂、数据量大、迭代快。",
        "测试开发能把验证流程标准化、自动化，直接影响交付质量和研发效率。",
        "回答里如果能提到数据正确性和工具链稳定性，会更贴业务。"
      ]),
      q("glw-test-data-management", "intermediate", true, "自动化测试里的测试数据应该怎么管理？", ["测试数据", "数据管理"], [
        "测试数据最好和用例生命周期解耦，做到可初始化、可回收、可重复执行。",
        "共享测试数据如果没有隔离，最容易引入相互污染和偶发失败。",
        "这类题重点是体现你理解稳定性很多时候不是代码逻辑，而是数据治理问题。"
      ]),
      q("glw-test-result-validation", "intermediate", true, "如果系统输出的是统计结果或分析结果，测试时如何验证正确性？", ["统计结果", "验证正确性"], [
        "通常要准备基准样本、人工可校验样本或历史已知结果做对照。",
        "再覆盖异常值、边界值和组合筛选场景，避免只验证主流程。",
        "这类回答如果能强调结果可追溯和口径一致性，会更符合数据类工具岗位。"
      ])
    ],
    "广立微 / Python 岗": [
      q("glw-python-list-tuple", "basic", true, "Python 里列表和元组的区别是什么？", ["Python", "list", "tuple"], [
        "列表可变，适合动态增删改；元组不可变，更适合表达不应修改的数据。",
        "元组通常更轻量，也更适合做字典键或多值返回的稳定结构。",
        "这道题虽然基础，但回答时最好落到实际使用场景。"
      ]),
      q("glw-python-dict", "basic", true, "字典为什么查找通常比较快？", ["dict", "哈希表"], [
        "字典底层通常是哈希表，通过键的哈希值快速定位槽位，所以平均查找复杂度接近 O(1)。",
        "如果哈希冲突严重，性能也可能退化，所以平均快不等于永远快。",
        "答题时说清原理和边界，比只背复杂度更好。"
      ]),
      q("glw-python-generator", "intermediate", true, "生成器的核心价值是什么？", ["生成器", "yield"], [
        "生成器按需产生数据，不需要一次性把所有结果都放进内存。",
        "它特别适合处理大日志、流式数据和逐批计算场景。",
        "如果能补充 yield 和普通返回的区别，回答会更完整。"
      ]),
      q("glw-python-log-processing", "intermediate", true, "如果用 Python 处理大日志文件，你会怎么做？", ["日志处理", "大文件"], [
        "优先逐行读取、边读边过滤统计，而不是把整文件一次性读入内存。",
        "必要时再结合正则、collections、pandas 或分批处理，但要先看数据规模和性能要求。",
        "这类回答的重点是流式思维和内存意识。"
      ]),
      q("glw-python-thread-process", "intermediate", true, "Python 里多线程和多进程一般怎么选？", ["多线程", "多进程", "GIL"], [
        "CPU 密集型任务更倾向多进程，IO 密集型任务更适合多线程或异步。",
        "因为 GIL 的存在，纯计算任务用线程通常拿不到理想的并行收益。",
        "好的回答应该体现你会根据任务类型选模型，而不是死记结论。"
      ]),
      q("glw-python-script-design", "basic", true, "写自动化脚本时你最关注什么？", ["自动化脚本", "可维护性"], [
        "优先关注可维护性、异常处理、日志、参数化和幂等性。",
        "脚本不是一次跑通就结束，而是要能在环境和数据变化时稳定运行。",
        "如果脚本失败后很难定位，那它在工程里价值就会大幅下降。"
      ]),
      q("glw-python-data-analysis", "intermediate", true, "如果让你写一个测试数据分析脚本，你会怎么设计？", ["数据分析", "脚本设计"], [
        "我会拆成输入解析、数据清洗、指标统计和结果导出几个模块，降低后续修改成本。",
        "这样后续换输入格式或增加统计指标时，不需要整体重写。",
        "模块化设计是这道题最该体现的工程意识。"
      ]),
      q("glw-python-pandas", "intermediate", true, "pandas 适合什么场景，什么时候不适合？", ["pandas"], [
        "pandas 适合中等规模结构化数据分析、聚合、透视和报表导出。",
        "如果数据量特别大、实时性要求强或逻辑很简单，流式处理、数据库或分布式方案可能更合适。",
        "工具选择本质上取决于数据规模、时延要求和维护成本。"
      ]),
      q("glw-python-exception", "basic", true, "写数据处理或自动化脚本时，异常处理为什么重要？", ["异常处理", "脚本"], [
        "脚本经常跑在批处理或无人值守场景，异常如果直接吞掉，后续定位会非常困难。",
        "好的异常处理应该包含关键上下文、失败原因和必要的兜底清理动作。",
        "面试里最好强调异常处理是稳定性设计的一部分，不只是 try except 语法。"
      ]),
      q("glw-python-regex", "intermediate", true, "日志解析里正则表达式适合怎么用，什么时候不该滥用？", ["正则", "日志解析"], [
        "正则适合快速提取固定格式字段，但模式太复杂时会降低可读性和维护性。",
        "如果输入本身是结构化格式，优先用明确的解析器或分隔规则通常更稳。",
        "这道题主要看你有没有工程上的取舍意识，而不是会不会写复杂正则。"
      ])
    ],
    "广立微 / 半导体业务认知": [
      q("glw-biz-eda", "basic", true, "你理解的 EDA 是做什么的？", ["EDA", "半导体"], [
        "EDA 是电子设计自动化，核心是用软件工具支持芯片设计、验证、制造和测试相关流程。",
        "它不是单一工具，而是一整套覆盖设计到量产的数据和工程体系。",
        "如果面的是软件岗，重点不在背全流程，而在于理解软件如何提升效率和质量。"
      ]),
      q("glw-biz-yield", "basic", true, "什么是良率？影响芯片良率的因素有哪些？", ["良率", "yield"], [
        "良率可以理解为满足规格要求的芯片占比，是制造和测试阶段非常关键的指标。",
        "影响因素包括工艺波动、缺陷密度、设计容错、测试覆盖率和量产稳定性。",
        "这类题不要求你像工艺专家一样回答，但要体现基本业务感知。"
      ]),
      q("glw-biz-dft-ate", "intermediate", true, "什么是 DFT 和 ATE？", ["DFT", "ATE"], [
        "DFT 是面向可测试性的设计方法，目标是在设计阶段就为后续测试留好手段。",
        "ATE 是自动测试设备，用于在生产或验证阶段执行测试并采集结果。",
        "两者一个更偏设计可测性，一个更偏执行测试和数据获取。"
      ]),
      q("glw-biz-flow", "intermediate", true, "你理解的芯片测试流程大致是什么样？", ["芯片测试", "测试流程"], [
        "可以从测试方案准备、向量或程序生成、上机测试、数据采集、结果分析和问题回溯来理解。",
        "不同阶段还会关联良率分析、失效分析和工艺优化。",
        "回答时不用装得很深，但最好体现流程意识和数据闭环意识。"
      ]),
      q("glw-biz-tool-design", "intermediate", true, "如果让你做一个测试数据分析工具，你会优先考虑什么？", ["测试数据分析", "工具设计"], [
        "先明确输入数据格式、核心分析指标和使用者最关心的查询与定位路径。",
        "然后考虑大数据量下的导入效率、统计性能、结果准确性和可视化方式。",
        "这道题很适合把软件能力和业务理解串起来回答。"
      ]),
      q("glw-biz-massive-data", "intermediate", true, "海量 wafer 或测试日志数据一般怎么做清洗和统计？", ["wafer", "日志", "数据清洗"], [
        "通常会先做格式标准化、异常值处理和字段校验，再进入分维度聚合和指标统计。",
        "数据量大时要考虑分批处理、索引、并行计算和结果缓存。",
        "回答时强调数据正确性和可追溯性，会更像工程场景而不是算法题。"
      ]),
      q("glw-biz-value", "basic", true, "软件工具如何帮助工艺优化、缺陷定位和量产提效？", ["工艺优化", "缺陷定位", "量产"], [
        "软件的价值在于把分散的数据、流程和规则串起来，提升分析效率和决策速度。",
        "比如更快发现异常模式、更准确做缺陷归因、更稳定支撑批量分析和回溯。",
        "这类岗位看重的不只是代码能力，也看你能否理解工具对业务链路的价值。"
      ]),
      q("glw-biz-wafer-map", "intermediate", true, "如果看到 wafer map 上某些区域集中异常，你会优先想到什么？", ["wafer map", "异常分析"], [
        "这通常提示问题可能不是单点随机缺陷，而与工艺、设备或版图区域特征有关。",
        "下一步会结合批次、机台、工艺步骤和历史数据做交叉比对。",
        "这道题不是要你像工艺专家一样给结论，而是看你是否具备数据关联分析意识。"
      ]),
      q("glw-biz-yield-analysis", "intermediate", true, "如果某一版本上线后良率统计突然波动，你会怎么分析？", ["良率波动", "分析"], [
        "先确认是否是统计口径、数据源或时间窗口变化导致的假波动。",
        "再区分是真实工艺问题、测试程序变化还是数据处理链路引入的偏差。",
        "这类题关键在于先验证数据可信性，再判断业务根因。"
      ])
    ],
    "广立微 / 编程题": [
      q("glw-code-reverse-list", "basic", true, "手写反转单链表，一般怎么答？", ["链表", "反转链表", "编程题"], [
        "先定义三个指针 prev、current、next，分别表示前驱节点、当前节点和下一节点。",
        "遍历链表时先保存 next，再把 current->next 指向 prev，然后整体向前推进。",
        "循环结束后，prev 指向的新头节点就是答案。",
        "边界上要考虑空链表和只有一个节点的情况，这两种情况直接返回原头节点即可。"
      ], {
        diagramSteps: [
          "初始状态下，prev 指向空，current 指向头节点，链表方向还是原来的 next 指针方向。",
          "第一轮循环先把 current 的下一个节点保存到 next，避免反转后链路丢失。",
          "然后让 current->next 指向 prev，相当于把当前节点这根箭头反过来。",
          "接着把 prev 挪到 current，把 current 挪到 next，继续处理后面的节点。",
          "当 current 走到空时，prev 正好停在原链表最后一个节点，也就是新头节点。"
        ],
        cppCode: [
          "struct ListNode {",
          "    int val;",
          "    ListNode* next;",
          "    ListNode(int x) : val(x), next(nullptr) {}",
          "};",
          "",
          "ListNode* reverseList(ListNode* head) {",
          "    ListNode* prev = nullptr;",
          "    ListNode* current = head;",
          "",
          "    while (current != nullptr) {",
          "        ListNode* next = current->next;",
          "        current->next = prev;",
          "        prev = current;",
          "        current = next;",
          "    }",
          "",
          "    return prev;",
          "}"
        ].join("\n"),
        complexity: [
          "时间复杂度：O(n)，每个节点只访问一次。",
          "空间复杂度：O(1)，只用了常数级辅助指针。"
        ]
      }),
      q("glw-code-lru", "intermediate", true, "LRU 缓存一般怎么实现？", ["LRU", "哈希表", "双向链表"], [
        "核心思路是“哈希表 + 双向链表”，哈希表负责按 key O(1) 找到节点，双向链表负责维护最近使用顺序。",
        "每次 get 或 put 命中后，都把对应节点移动到链表头部，表示最近访问过。",
        "当容量满时，淘汰链表尾部节点，因为尾部就是最久未使用的数据。",
        "这题真正考的是数据结构组合能力，以及你能不能把复杂度稳定在 O(1)。"
      ], {
        diagramSteps: [
          "先把链表头理解为“最近使用”，链表尾理解为“最久未使用”。",
          "哈希表保存 key 到链表节点位置的映射，这样查一个 key 时不用在线性链表里找。",
          "get(key) 命中后，先通过哈希表拿到节点，再把这个节点移动到链表头部。",
          "put(key, value) 如果 key 已存在，就更新值并移动到头部；如果不存在，就新插入头部。",
          "当容量满时，删除链表尾部节点，同时把这个节点对应的 key 从哈希表里删掉。"
        ],
        cppCode: [
          "class LRUCache {",
          "public:",
          "    explicit LRUCache(int capacity) : capacity_(capacity) {}",
          "",
          "    int get(int key) {",
          "        auto it = cache_.find(key);",
          "        if (it == cache_.end()) {",
          "            return -1;",
          "        }",
          "        items_.splice(items_.begin(), items_, it->second);",
          "        return it->second->second;",
          "    }",
          "",
          "    void put(int key, int value) {",
          "        auto it = cache_.find(key);",
          "        if (it != cache_.end()) {",
          "            it->second->second = value;",
          "            items_.splice(items_.begin(), items_, it->second);",
          "            return;",
          "        }",
          "",
          "        if (static_cast<int>(items_.size()) == capacity_) {",
          "            int oldKey = items_.back().first;",
          "            cache_.erase(oldKey);",
          "            items_.pop_back();",
          "        }",
          "",
          "        items_.emplace_front(key, value);",
          "        cache_[key] = items_.begin();",
          "    }",
          "",
          "private:",
          "    int capacity_;",
          "    std::list<std::pair<int, int>> items_;",
          "    std::unordered_map<int, std::list<std::pair<int, int>>::iterator> cache_;",
          "};"
        ].join("\n"),
        complexity: [
          "get 和 put 的平均时间复杂度都是 O(1)。",
          "空间复杂度：O(capacity)，需要同时维护链表和哈希表。"
        ]
      }),
      q("glw-code-topk", "intermediate", true, "给一个数组找第 k 大元素，常见做法有哪些？", ["TopK", "第k大", "堆"], [
        "最稳妥的思路是维护一个大小为 k 的最小堆，遍历数组时让堆里始终保存当前最大的 k 个元素。",
        "如果新元素比堆顶大，就弹出堆顶并把新元素放进去；如果更小，就直接跳过。",
        "遍历结束后，堆顶就是第 k 大元素。",
        "如果继续追问，还可以补充快速选择法平均复杂度更优，但实现和最坏情况讨论会更复杂。"
      ], {
        diagramSteps: [
          "先把最小堆看成一个“候选区”，里面只保留当前扫描过元素里最大的 k 个。",
          "前 k 个元素先直接入堆，这时堆顶是这 k 个元素里最小的那个。",
          "继续扫描后面的元素时，如果新元素不比堆顶大，说明它进不了前 k，直接跳过。",
          "如果新元素比堆顶大，就把堆顶弹出，再把新元素压进去，候选区保持仍然是最大的 k 个。",
          "全部扫描结束后，堆顶正好是这 k 个最大元素里最小的那个，也就是第 k 大。"
        ],
        cppCode: [
          "int findKthLargest(std::vector<int>& nums, int k) {",
          "    std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;",
          "",
          "    for (int value : nums) {",
          "        if (static_cast<int>(minHeap.size()) < k) {",
          "            minHeap.push(value);",
          "        } else if (value > minHeap.top()) {",
          "            minHeap.pop();",
          "            minHeap.push(value);",
          "        }",
          "    }",
          "",
          "    return minHeap.top();",
          "}"
        ].join("\n"),
        complexity: [
          "时间复杂度：O(nlogk)，每个元素最多触发一次堆调整。",
          "空间复杂度：O(k)，堆里最多保留 k 个元素。"
        ]
      }),
      q("glw-code-cycle-list", "basic", true, "如何判断链表是否有环？", ["链表有环", "快慢指针"], [
        "最经典的做法是 Floyd 快慢指针，慢指针每次走一步，快指针每次走两步。",
        "如果链表有环，快指针最终一定会在环内追上慢指针。",
        "如果没有环，快指针会先走到空指针或空指针的 next，循环结束。",
        "这题重点除了思路本身，还要注意 while 条件要先判断 fast 和 fast->next。"
      ], {
        diagramSteps: [
          "把慢指针想成每次走 1 格，快指针想成每次走 2 格。",
          "如果链表没有环，快指针一定会先走到终点，因为它速度更快。",
          "如果链表有环，快指针进入环后会不断追赶慢指针。",
          "因为两者速度差恒定为 1，所以在环里快指针迟早会追上慢指针。",
          "一旦两者相遇，就能判断有环；如果循环退出都没相遇，说明无环。"
        ],
        cppCode: [
          "bool hasCycle(ListNode* head) {",
          "    ListNode* slow = head;",
          "    ListNode* fast = head;",
          "",
          "    while (fast != nullptr && fast->next != nullptr) {",
          "        slow = slow->next;",
          "        fast = fast->next->next;",
          "",
          "        if (slow == fast) {",
          "            return true;",
          "        }",
          "    }",
          "",
          "    return false;",
          "}"
        ].join("\n"),
        complexity: [
          "时间复杂度：O(n)，最坏情况下快慢指针都在线性范围内完成判断。",
          "空间复杂度：O(1)，没有使用额外容器。"
        ]
      }),
      q("glw-code-level-order", "basic", true, "二叉树层序遍历一般怎么写？", ["二叉树", "层序遍历", "队列"], [
        "层序遍历天然适合用队列，因为它就是按节点进入队列的先后顺序逐层处理。",
        "先把根节点入队，每次弹出一个节点时，把它的左右孩子按顺序继续入队。",
        "如果题目要求按层返回结果，就在每轮循环开始时先记录当前队列长度。",
        "然后只处理这一层对应数量的节点，收集成一个临时数组再放入结果。"
      ], {
        diagramSteps: [
          "先把根节点放进队列，队列就代表“下一批要访问的节点”。",
          "每轮开始时先记住当前队列长度，这个长度就是当前层的节点数。",
          "然后连续弹出这么多个节点，把它们的值收集到当前层结果中。",
          "在弹出每个节点的同时，把它的左孩子和右孩子依次压入队列。",
          "这样本轮结束后，队列里剩下的正好就是下一层的所有节点。"
        ],
        cppCode: [
          "std::vector<std::vector<int>> levelOrder(TreeNode* root) {",
          "    std::vector<std::vector<int>> result;",
          "    if (root == nullptr) {",
          "        return result;",
          "    }",
          "",
          "    std::queue<TreeNode*> nodes;",
          "    nodes.push(root);",
          "",
          "    while (!nodes.empty()) {",
          "        int levelSize = static_cast<int>(nodes.size());",
          "        std::vector<int> level;",
          "",
          "        for (int i = 0; i < levelSize; ++i) {",
          "            TreeNode* current = nodes.front();",
          "            nodes.pop();",
          "            level.push_back(current->val);",
          "",
          "            if (current->left != nullptr) {",
          "                nodes.push(current->left);",
          "            }",
          "            if (current->right != nullptr) {",
          "                nodes.push(current->right);",
          "            }",
          "        }",
          "",
          "        result.push_back(level);",
          "    }",
          "",
          "    return result;",
          "}"
        ].join("\n"),
        complexity: [
          "时间复杂度：O(n)，每个节点只会入队和出队一次。",
          "空间复杂度：O(n)，最坏情况下队列需要保存一整层节点。"
        ]
      }),
      q("glw-code-producer-consumer", "advanced", true, "如果让你写一个生产者消费者模型，通常要考虑什么？", ["生产者消费者", "并发", "条件变量"], [
        "先明确共享资源是什么，最常见的是一个线程安全队列，生产者往里放数据，消费者从里取数据。",
        "然后用 mutex 保护队列，用 condition_variable 协调“队列为空时等待”和“队列有数据时唤醒”。",
        "如果题目更完整，还要考虑队列容量限制、程序退出时如何优雅停止、以及伪唤醒要用谓词循环判断。",
        "面试里把这些边界讲清楚，往往比只写出最简版代码更能体现并发基础。"
      ], {
        diagramSteps: [
          "把共享队列理解成中间缓冲区，生产者负责往里放任务，消费者负责从里取任务。",
          "当队列为空时，消费者不能忙等，而是应该挂起等待 notEmpty 条件。",
          "当队列满时，生产者也不能继续塞数据，而是等待 notFull 条件。",
          "每次生产成功后唤醒消费者，每次消费成功后唤醒生产者，这样系统才能持续流转。",
          "如果程序准备退出，还要设置 stopped 标志并唤醒所有等待线程，避免线程永久阻塞。"
        ],
        cppCode: [
          "class TaskQueue {",
          "public:",
          "    void produce(int value) {",
          "        std::unique_lock<std::mutex> lock(mutex_);",
          "        notFull_.wait(lock, [this]() { return queue_.size() < capacity_ || stopped_; });",
          "        if (stopped_) {",
          "            return;",
          "        }",
          "        queue_.push(value);",
          "        notEmpty_.notify_one();",
          "    }",
          "",
          "    bool consume(int& value) {",
          "        std::unique_lock<std::mutex> lock(mutex_);",
          "        notEmpty_.wait(lock, [this]() { return !queue_.empty() || stopped_; });",
          "        if (queue_.empty()) {",
          "            return false;",
          "        }",
          "        value = queue_.front();",
          "        queue_.pop();",
          "        notFull_.notify_one();",
          "        return true;",
          "    }",
          "",
          "    void stop() {",
          "        std::lock_guard<std::mutex> lock(mutex_);",
          "        stopped_ = true;",
          "        notEmpty_.notify_all();",
          "        notFull_.notify_all();",
          "    }",
          "",
          "private:",
          "    std::queue<int> queue_;",
          "    std::mutex mutex_;",
          "    std::condition_variable notEmpty_;",
          "    std::condition_variable notFull_;",
          "    std::size_t capacity_ = 100;",
          "    bool stopped_ = false;",
          "};"
        ].join("\n"),
        complexity: [
          "单次生产和消费的平均时间复杂度都是 O(1)。",
          "额外空间复杂度取决于队列容量，通常是 O(capacity)。"
        ]
      }),
      q("glw-code-log-parse", "intermediate", true, "给一批日志，统计错误码 TopN，你会怎么写？", ["日志统计", "TopN", "哈希统计"], [
        "如果日志量不大，最直接的做法是逐行读取日志，解析出错误码后用 unordered_map 统计频次。",
        "统计完成后再把结果放进数组排序，或者维护一个最小堆找出前 N 个高频错误码。",
        "如果数据量很大，关键点不是花哨算法，而是要避免一次性把整个文件读进内存。",
        "所以回答时最好强调流式读取、边读边统计，以及最终取 TopN 的方式。"
      ], {
        diagramSteps: [
          "第一步是逐行读取日志，不要先把整个文件一次性装进内存。",
          "每读到一行，就调用解析逻辑提取错误码，如果这一行没有错误码就跳过。",
          "提取到错误码后，在哈希表里把这个错误码对应的计数加 1。",
          "全部日志扫完后，哈希表里就保存了“错误码 -> 出现次数”的统计结果。",
          "最后再对统计结果做排序或维护 TopN 堆，得到最高频的错误码列表。"
        ],
        cppCode: [
          "std::vector<std::pair<std::string, int>> topNErrors(",
          "        const std::vector<std::string>& logs, int n) {",
          "    std::unordered_map<std::string, int> frequency;",
          "",
          "    for (const std::string& line : logs) {",
          "        std::string errorCode = parseErrorCode(line);",
          "        if (!errorCode.empty()) {",
          "            ++frequency[errorCode];",
          "        }",
          "    }",
          "",
          "    std::vector<std::pair<std::string, int>> result(frequency.begin(), frequency.end());",
          "    std::sort(result.begin(), result.end(), [](const auto& left, const auto& right) {",
          "        return left.second > right.second;",
          "    });",
          "",
          "    if (static_cast<int>(result.size()) > n) {",
          "        result.resize(n);",
          "    }",
          "",
          "    return result;",
          "}"
        ].join("\n"),
        complexity: [
          "统计阶段时间复杂度约为 O(m)，m 是日志行数；排序阶段复杂度约为 O(klogk)，k 是不同错误码数量。",
          "空间复杂度：O(k)，需要保存每个错误码的频次。"
        ]
      }),
      q("glw-code-no-repeat", "intermediate", true, "最长不重复子串这类题，一般的思路是什么？", ["滑动窗口", "最长不重复子串"], [
        "这类题最常见的做法是滑动窗口，用 left 和 right 维护一个当前不含重复字符的区间。",
        "再用哈希表记录每个字符上一次出现的位置，当发现重复字符时，把 left 移动到合法位置。",
        "每次扩展 right 后都更新窗口长度最大值，最后得到答案。",
        "面试里最好强调 left 不能回退，所以整体仍然是线性复杂度。"
      ], {
        diagramSteps: [
          "先把窗口理解成区间 [left, right]，保证窗口里的字符始终不重复。",
          "right 每次向右扩一个字符，表示尝试把这个新字符纳入当前窗口。",
          "如果这个字符之前在窗口里出现过，就把 left 跳到上次出现位置的后一位。",
          "这样处理后，新的窗口仍然满足“没有重复字符”的约束。",
          "每走一步都计算一次当前窗口长度并更新最大值，最后得到最长不重复子串长度。"
        ],
        cppCode: [
          "int lengthOfLongestSubstring(const std::string& s) {",
          "    std::unordered_map<char, int> lastIndex;",
          "    int left = 0;",
          "    int best = 0;",
          "",
          "    for (int right = 0; right < static_cast<int>(s.size()); ++right) {",
          "        auto it = lastIndex.find(s[right]);",
          "        if (it != lastIndex.end()) {",
          "            left = std::max(left, it->second + 1);",
          "        }",
          "        lastIndex[s[right]] = right;",
          "        best = std::max(best, right - left + 1);",
          "    }",
          "",
          "    return best;",
          "}"
        ].join("\n"),
        complexity: [
          "时间复杂度：O(n)，左右指针整体都只向前移动。",
          "空间复杂度：O(k)，k 是窗口内可能出现的字符种类数。"
        ]
      })
    ],
    "芯片 / EDA 公司专项": [
      q("eda-company-toolchain", "basic", true, "你怎么理解芯片设计和制造流程里 EDA 工具链的价值？", ["EDA", "工具链", "芯片设计"], [
        "EDA 工具链的核心价值是把复杂的设计、验证、实现和分析流程软件化、自动化。",
        "它不仅提高效率，还帮助团队在更早阶段发现问题、降低反复迭代成本。",
        "软件岗位回答这道题时，重点是理解工具如何支撑工程流程，而不是背所有工序名词。"
      ]),
      q("eda-company-cpp-linux", "basic", true, "为什么很多芯片和 EDA 公司会强调 C++ 和 Linux 基础？", ["C++", "Linux", "EDA 公司"], [
        "很多工具本身就是高性能桌面或后台程序，历史积累和性能需求决定了 C++ 很常见。",
        "Linux 环境广泛用于研发、自动化运行和批处理任务，所以排障和脚本能力也很重要。",
        "这类岗位通常不是只考语法，而是看你能不能把性能、工程性和系统能力结合起来。"
      ]),
      q("eda-company-data-correctness", "intermediate", true, "做分析类或验证类工具时，为什么“结果正确性”往往比页面展示更重要？", ["结果正确性", "分析工具"], [
        "这类工具往往直接影响工程决策，结果一旦错了，后续设计、测试或工艺判断都可能被带偏。",
        "所以数据口径、边界条件、一致性校验和可追溯性通常比纯界面效果更关键。",
        "回答时能体现你重视正确性基线，会比单纯强调 UI 或速度更贴岗位。"
      ]),
      q("eda-company-large-data", "intermediate", true, "如果工具要处理海量测试数据或版图分析结果，你会优先考虑什么？", ["海量数据", "性能", "分析结果"], [
        "先明确数据规模、查询模式和最关键的时延指标，再决定存储、索引和计算方案。",
        "同时要考虑导入效率、增量更新、结果缓存和资源使用上限。",
        "这类题关键在于你能先抓约束，再谈技术方案，而不是一上来堆框架。"
      ]),
      q("eda-company-algorithm-collab", "intermediate", true, "如果你需要和算法、工艺或测试专家合作开发工具，你会怎么降低沟通成本？", ["跨团队协作", "算法", "工艺"], [
        "先把抽象需求落成可验证的数据输入、输出和边界条件，避免只停留在口头概念。",
        "再通过小样本验证、原型和中间结果对齐，让双方尽快建立共同语义。",
        "这类岗位很看重把领域知识转成软件实现的能力，所以协作表达很重要。"
      ]),
      q("eda-company-performance", "intermediate", true, "EDA 或数据分析工具的性能优化，你会优先从哪些方向入手？", ["性能优化", "EDA 工具"], [
        "先通过 profiling 找热点，再区分是 CPU 计算、内存访问、IO 还是数据结构选型问题。",
        "很多优化最终会落到减少无效扫描、优化数据布局、控制拷贝和并行策略上。",
        "回答里最好体现先量化基线，再做针对性优化，而不是泛泛而谈。"
      ]),
      q("eda-company-validation", "intermediate", true, "做这类工具时，怎么验证你的计算结果或统计结果是可信的？", ["验证", "统计结果", "可信性"], [
        "通常会准备基准样例、历史已知结果或人工校验样本做对比验证。",
        "再通过边界用例、异常输入和回归测试保证后续修改不会破坏结果。",
        "如果结果影响业务决策，最好还能保留计算链路和关键中间数据以便追溯。"
      ]),
      q("eda-company-interest", "basic", true, "如果面试官问你为什么想做芯片或 EDA 软件，你怎么回答更稳？", ["为什么做 EDA", "职业动机"], [
        "可以从技术深度、业务门槛高、工具软件价值明确这几个角度来回答。",
        "同时把自己的能力和岗位需求对上，比如 C++、Linux、数据处理、工程化能力。",
        "更有说服力的说法是：我希望做离核心工程问题更近、长期积累价值更高的软件。"
      ])
    ],
    "数据库直讲": [
      q("db-acid", "basic", true, "事务的 ACID 分别靠什么机制实现？", ["事务", "ACID", "undo", "redo"], [
        "先把四个字和实现对上：原子性靠 undo log，持久性靠 redo log，隔离性靠锁和 MVCC，一致性是前三者共同要达成的目标。",
        "原子性的关键在于「半成功」这个状态最危险：转账扣了款没记账，系统自己都不知道该从哪儿接着往下做。undo log 记录的是「怎么撤销」，崩溃重启后照着它把没提交的事务痕迹全抹掉。",
        "持久性靠的是先写日志再写数据页：改数据页是随机 IO 很慢，而 redo log 是顺序追加很快。提交时只要 redo 落盘就算数，数据页可以慢慢刷。",
        "隔离性有两条路：读靠 MVCC 走历史版本不加锁，写靠行锁和间隙锁互斥。",
        "一致性最特殊，它和另外三个不在一个层次上：A、I、D 是数据库提供的手段，C 是目标，而且很多业务约束（比如持仓不能为负）数据库根本不知道，得靠应用层保证。"
      ], {
        diagramSteps: [
          "把一次转账拆成两步：A 账户扣 100、B 账户加 100。",
          "假设第一步写完、第二步还没执行时断电。",
          "没有事务：钱从 A 扣了却没到 B，100 元凭空消失，账目再也对不平。",
          "有事务：重启时按 undo log 把第一步撤销，回到转账前的状态。",
          "整个过程对外表现为「这笔转账从没发生过」，而不是「做了一半」。",
          "提交成功的那些事务则相反：即使数据页还没落盘，redo log 也能把它们重做出来。"
        ],
        pitfalls: [
          "把一致性也说成一种独立机制，被追问「一致性靠什么实现」时答不上来 —— 它是目标不是手段。",
          "以为提交就等于数据写进磁盘的数据文件了，实际上提交只保证 redo log 落盘，数据页是异步刷的。",
          "先 SELECT 判断余额再 UPDATE 扣款，两条语句之间别人可能已经把钱花掉，正确写法是把条件写进 UPDATE 的 WHERE 里并检查影响行数。",
          "事务里夹杂调用外部接口、发消息等操作，一旦回滚这些副作用撤不回来。"
        ],
        cppCode: "START TRANSACTION;\n\n-- 把余额判断写进 WHERE，让判断和扣减成为同一个原子操作\nUPDATE account SET balance = balance - 100\n WHERE id = 1 AND balance >= 100;\n-- 检查影响行数：为 0 说明余额不足，要主动 ROLLBACK\n\nUPDATE account SET balance = balance + 100 WHERE id = 2;\nINSERT INTO transfer_log (from_id, to_id, amount) VALUES (1, 2, 100);\n\nCOMMIT;\n",
        complexity: [
          "这题是数据库部分的开场题，面试官想确认你是否理解机制而不只是背首字母。",
          "答完四个字最好主动补一句一致性的特殊性，这是区分「背过」和「懂了」的分水岭。"
        ]
      }),
      q("db-isolation-levels", "basic", true, "有哪几种隔离级别？分别会出现什么并发问题？", ["隔离级别", "脏读", "不可重复读", "幻读"], [
        "先讲三个现象，隔离级别的设计动机就自然出来了。",
        "脏读：事务 B 改了值还没提交，事务 A 就读到了，结果 B 回滚了 —— A 读到的是一个从来没存在过的值。",
        "不可重复读：A 读到余额 100，B 改成 200 并提交，A 在同一个事务里再读变成了 200，前后自相矛盾。",
        "幻读：A 查「余额大于一千的账户」得到 3 行，B 插入一行也满足条件并提交，A 再查变成 4 行，凭空多出一条。",
        "四个级别依次是：读未提交三种都有；读已提交解决脏读，是 Oracle 和 PostgreSQL 的默认；可重复读再解决不可重复读，是 MySQL 的默认；串行化全部解决但吞吐极低。"
      ], {
        diagramSteps: [
          "按「越来越隐蔽」的顺序理解这三个现象。",
          "脏读的问题在于读到了未提交的中间态，这个值可能根本不会存在。",
          "不可重复读的问题在于同一行的内容在事务中途变了。",
          "幻读的问题在于符合条件的行数变了 —— 注意区别：不可重复读针对已有行的内容，幻读针对行的数量。",
          "隔离级别越高，需要的锁越多、并发度越低，是一条明确的取舍曲线。",
          "选级别时看业务：资金账目类要强一致，日志报表类可以放宽。"
        ],
        pitfalls: [
          "把不可重复读和幻读混为一谈，这是这块最常见的失分点。",
          "以为隔离级别越高越好，串行化在真实业务里几乎不可用。",
          "忘了不同数据库默认级别不同：MySQL 是可重复读，Oracle 和 PostgreSQL 是读已提交。",
          "以为隔离级别只影响读，其实它同时决定了写操作要加什么范围的锁。"
        ],
        cppCode: "-- 查看当前隔离级别\nSELECT @@transaction_isolation;\n\n-- 只改本次会话\nSET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;\n",
        complexity: [
          "回答时按「先讲三个异常，再讲四个级别怎么逐个消掉它们」的顺序，比直接背表格清楚得多。",
          "能顺带说出各数据库的默认值，会显得有实际使用经验。"
        ]
      }),
      q("db-phantom-read", "intermediate", true, "可重复读到底解决幻读了没有？", ["幻读", "可重复读", "间隙锁", "MVCC"], [
        "这题的正确答法是分两层说，只回答「解决了」或「没解决」都会被追问倒。",
        "按 SQL 标准：可重复读不保证解决幻读，串行化才保证。",
        "但在 InnoDB 的实现里，两条路都被堵上了：快照读（普通 SELECT）靠 MVCC，整个事务看到的是同一张快照，新插入的行自然看不见。",
        "当前读（SELECT ... FOR UPDATE、UPDATE、DELETE）靠间隙锁，把记录之间的缝隙也锁住，别的事务根本插不进来。",
        "所以标准答案是：标准上不保证，InnoDB 的实现里基本解决了 —— 主动区分「标准」和「实现」，这题就答满了。"
      ], {
        diagramSteps: [
          "先分清幻读发生在哪两种读上，这决定了用哪套机制去挡。",
          "快照读：事务开始时生成 ReadView，之后无论别人插入多少行，顺着版本链都找不到它们，天然没有幻读。",
          "当前读：要读最新数据，MVCC 帮不上忙，必须靠锁。",
          "间隙锁的思路是：幻读的元凶是「还不存在的行」，没有行就无从加锁，那就转而锁住区间。",
          "比如锁住 id 在 5 到 20 之间，不仅锁住已有的 5、10、20，还锁住它们之间的缝，id=7 插不进来。",
          "代价是并发度下降：明明没有真实冲突的插入也会被挡住。"
        ],
        pitfalls: [
          "只说「InnoDB 解决了幻读」而不提标准，遇到较真的面试官会认为你没读过规范。",
          "只说「标准里 RR 不解决幻读」，又显得不了解实际用的数据库。",
          "以为 MVCC 能解决所有幻读，实际上当前读完全绕过快照，必须靠间隙锁。",
          "忘了间隙锁只在可重复读级别下生效，读已提交级别默认是关闭的。"
        ],
        cppCode: "-- 快照读：走 MVCC，看到的是事务开始时的快照\nSELECT * FROM account WHERE balance > 1000;\n\n-- 当前读：读最新值并加锁，RR 下会带间隙锁\nSELECT * FROM account WHERE balance > 1000 FOR UPDATE;\n\n-- 看当前持有的锁\nSELECT * FROM performance_schema.data_locks;\n",
        complexity: [
          "这题是隔离级别的深水区，能答清楚说明你不是只背了一张对照表。",
          "把「快照读靠 MVCC、当前读靠间隙锁」这两句话记牢，基本能应对所有变形提问。"
        ]
      }),
      q("db-mvcc", "intermediate", true, "MVCC 是怎么做到读不加锁的？", ["MVCC", "版本链", "ReadView", "undo"], [
        "核心思路一句话：每次修改都不覆盖旧值，而是留一份旧版本，读的人去读属于自己的那一版，于是读和写互不阻塞。",
        "每行数据除了业务字段，还隐藏着「最后修改它的事务 id」和一个「回滚指针」。回滚指针指向 undo log 里的上一个版本，一个串一个就形成了版本链。",
        "事务开始读的时候会生成一张 ReadView，相当于进门时拍的快照，记下此刻哪些事务还在运行。",
        "读数据时顺着版本链往下找，跳过「比我晚开始的」和「还没提交的」版本，停在第一个「在我开始时就已提交」的版本上。",
        "这就是可重复读的由来：无论别人后来怎么改，我这个事务每次找到的都是同一版，而且全程一把锁都没加。"
      ], {
        diagramSteps: [
          "想象一行余额数据现在有三个版本：300（事务 99 改的，未提交）、200（事务 80 改的，已提交）、100（事务 60 改的，已提交）。",
          "三个版本用回滚指针串起来，最新的在前，旧的存在 undo log 里。",
          "现在事务 90 开始读，生成 ReadView。",
          "第一个版本是事务 99 改的，99 还没提交 —— 跳过。",
          "第二个版本是事务 80 改的，80 在 90 开始前就提交了 —— 就是它，读到 200。",
          "旧版本什么时候清理？等到没有任何 ReadView 还可能用到它时，由 purge 线程回收。"
        ],
        pitfalls: [
          "以为 MVCC 让所有操作都不用锁，实际上它只解决读，写与写之间仍然要靠行锁互斥。",
          "以为 ReadView 是事务一开始就生成的，其实在可重复读下是第一次快照读时才生成，读已提交下是每次 SELECT 都重新生成。",
          "长事务不提交会导致 undo log 里的旧版本一直不能回收，表空间被撑大，这是线上常见事故。",
          "以为 MVCC 是 MySQL 特有的，实际上 PostgreSQL、Oracle 都有各自的多版本实现。"
        ],
        cppCode: "-- 可重复读下：整个事务里两次读到的是同一个值\nSTART TRANSACTION;\nSELECT balance FROM account WHERE id = 1;  -- 第一次快照读，生成 ReadView\n-- 此时别的事务把它改成 999 并提交\nSELECT balance FROM account WHERE id = 1;  -- 仍然是原来的值\nCOMMIT;\n\n-- 查最久的活跃事务，排查长事务撑大 undo 的问题\nSELECT * FROM information_schema.innodb_trx ORDER BY trx_started;\n",
        complexity: [
          "读已提交和可重复读的差别，本质就是 ReadView 的生成时机不同 —— 这句话能一下子把两个级别串起来。",
          "面试里能主动提到长事务导致 undo 堆积，会显得有线上经验。"
        ]
      }),
      q("db-snapshot-vs-current-read", "intermediate", true, "快照读和当前读有什么区别？", ["快照读", "当前读", "for update"], [
        "普通 SELECT 是快照读，读的是 ReadView 对应的历史版本，不加任何锁。",
        "SELECT ... FOR UPDATE、LOCK IN SHARE MODE，以及 UPDATE、DELETE、INSERT 都是当前读，读的是最新已提交版本，并且会加锁。",
        "为什么写操作必须是当前读：如果基于一个旧快照去改，就会把别人已经提交的修改覆盖掉，等于丢更新。",
        "一个经典陷阱：同一事务里先普通 SELECT 读到 100，然后 UPDATE ... SET balance = balance + 1，再 SELECT。结果是基于最新值加 1，而不是基于你之前读到的 100。",
        "记住一句话：快照只管得住普通读，管不住写。"
      ], {
        diagramSteps: [
          "先判断语句类型：只有不带锁的普通 SELECT 才是快照读。",
          "快照读走版本链，找到自己 ReadView 该看的版本，不与任何人冲突。",
          "当前读绕过版本链直接读最新已提交的行，并对它加锁。",
          "加什么锁看情况：FOR UPDATE 加排他锁，LOCK IN SHARE MODE 加共享锁。",
          "在可重复读级别下，当前读还会连带加上间隙锁防止幻读。",
          "所以业务里要「读出来再改」的场景，必须用 FOR UPDATE，否则中间会被别人插一脚。"
        ],
        pitfalls: [
          "在需要「先查后改」的业务里用了普通 SELECT，两条语句之间被并发修改，导致超卖或重复扣款。",
          "滥用 FOR UPDATE，在大范围查询上加锁，把并发彻底堵死。",
          "以为 FOR UPDATE 只锁查出来的那几行，忘了 RR 级别下还会锁住区间。",
          "在没有走索引的条件上用 FOR UPDATE，会把扫过的所有行都锁上，效果接近锁表。"
        ],
        cppCode: "-- 错误：判断和扣减之间有窗口期\nSELECT stock FROM item WHERE id = 1;      -- 读到 1\n-- 别的事务此时也读到 1 并扣减\nUPDATE item SET stock = stock - 1 WHERE id = 1;\n\n-- 正确写法一：用当前读锁住这一行\nSELECT stock FROM item WHERE id = 1 FOR UPDATE;\n\n-- 正确写法二：把判断合进 UPDATE，一步到位\nUPDATE item SET stock = stock - 1 WHERE id = 1 AND stock > 0;\n",
        complexity: [
          "这题几乎必然会引申到超卖问题，提前准备好「把条件写进 UPDATE」这个答案。",
          "能说出「快照管不住写」这句话，就说明真正理解了两者的边界。"
        ]
      }),
      q("db-row-lock-index", "intermediate", true, "InnoDB 的行锁是加在行上还是加在索引上？", ["行锁", "索引", "锁表"], [
        "行锁是加在索引记录上的，不是加在数据行本身。这一点是很多线上并发事故的根源。",
        "如果 WHERE 条件走了索引，InnoDB 只锁命中的那几条索引记录，并发很好。",
        "如果条件没有走索引，InnoDB 没办法精确定位，只能逐行扫描，并把扫过的每一行都锁上 —— 效果基本等同于锁全表。",
        "所以「更新语句没走索引」不只是慢的问题，它会直接把整张表的并发打死，别的事务全在排队。",
        "推论：给经常出现在 UPDATE 和 DELETE 的 WHERE 条件上的字段建索引，收益不只是查询变快，更是保住并发度。"
      ], {
        diagramSteps: [
          "写一条 UPDATE，先用 EXPLAIN 看它走不走索引。",
          "走索引：只有命中的索引记录被加锁，其他行不受影响。",
          "没走索引：全表扫描，扫到哪一行就锁哪一行。",
          "虽然 MySQL 会对不满足条件的行提前释放锁，但扫描过程中的瞬时锁量依然巨大。",
          "此时别的事务想更新表里任何一行，都可能被阻塞。",
          "排查方法：看 information_schema.innodb_trx 里有没有长时间等待的事务，再回头看那条 SQL 的执行计划。"
        ],
        pitfalls: [
          "以为「行锁」这个名字意味着一定只锁一行，实际上取决于走不走索引。",
          "在没有索引的字段上批量 UPDATE，在业务高峰期直接把表锁死。",
          "索引区分度太低时优化器会放弃走索引，于是同一条 SQL 在数据量变化后突然开始锁表。",
          "只看 SQL 慢不慢，不看它锁了多少行，导致优化方向跑偏。"
        ],
        cppCode: "-- name 上没有索引：全表扫描，扫过的行都会被锁\nUPDATE account SET status = 1 WHERE name = '张三';\n\n-- 建好索引后只锁命中的记录\nALTER TABLE account ADD INDEX idx_name (name);\n\n-- 排查锁等待\nSELECT * FROM information_schema.innodb_trx;\nSELECT * FROM performance_schema.data_lock_waits;\n",
        complexity: [
          "这题能把索引和并发两块知识串起来，答好了印象分很高。",
          "结论一句话：索引不只是查询优化，更是并发控制的前提。"
        ]
      }),
      q("db-deadlock", "intermediate", true, "数据库死锁是怎么产生的？和多线程死锁有什么异同？", ["死锁", "循环等待", "重试"], [
        "模型完全一样：两个事务各自持有一把锁，又都在等对方那把，形成循环等待。",
        "典型场景是两个事务按相反顺序更新同两行，比如 A 先改 1 号再改 2 号，B 先改 2 号再改 1 号。",
        "最大的不同是：数据库自带死锁检测，发现环之后会主动挑一个事务回滚掉，而不是让两边一起卡死。",
        "所以应用层必须能接住这件事 —— 捕获死锁错误并重试，而不是直接把异常抛给用户。",
        "根治办法和写多线程代码一样：让所有事务按同一个顺序访问数据行，比如统一按主键从小到大更新。"
      ], {
        diagramSteps: [
          "事务 A 更新 1 号账户，拿到 1 号的行锁。",
          "事务 B 更新 2 号账户，拿到 2 号的行锁。",
          "事务 A 接着要更新 2 号，被 B 挡住，开始等待。",
          "事务 B 接着要更新 1 号，被 A 挡住，也开始等待 —— 环形成了。",
          "InnoDB 的死锁检测发现环，选择回滚代价较小的那个事务。",
          "被回滚的一方收到死锁错误，应用层捕获后重试，通常第二次就能成功。"
        ],
        pitfalls: [
          "把死锁错误当成致命异常直接往上抛，其实它是可以预期并重试的。",
          "无限重试且不加退避，几个事务反复互相撞车，把 CPU 打满。",
          "以为只有显式加锁才会死锁，实际上普通的 UPDATE 就会加行锁。",
          "事务里包含用户交互或远程调用，持锁时间被拉得极长，大幅提高死锁概率。",
          "只减小事务范围而不统一加锁顺序，只是降低了概率，没有根治。"
        ],
        cppCode: "-- 事务 A\nUPDATE account SET balance = balance - 100 WHERE id = 1;\nUPDATE account SET balance = balance + 100 WHERE id = 2;\n\n-- 事务 B（顺序相反，容易和 A 撞车）\nUPDATE account SET balance = balance - 50 WHERE id = 2;\nUPDATE account SET balance = balance + 50 WHERE id = 1;\n\n-- 事后分析：看最近一次死锁的完整现场\nSHOW ENGINE INNODB STATUS;\n",
        complexity: [
          "这题可以直接类比到并发编程里的锁顺序问题，能体现你对并发的整体理解。",
          "答案里一定要包含「应用层重试」和「统一加锁顺序」这两点，前者是止血，后者是根治。"
        ]
      }),
      q("db-btree", "basic", true, "索引为什么用 B+ 树，不用二叉树或哈希？", ["B+树", "索引", "磁盘IO"], [
        "回答的关键是先把前提说出来：数据在磁盘上，而磁盘是按页读的，且随机 IO 很慢。所以目标是尽量减少 IO 次数。",
        "B+ 树的非叶子节点只存索引键不存数据，一个 16KB 的页能塞下上千个键，扇出极大，树被压得很矮 —— 三四层就能撑几千万行，查一次只要三四次磁盘 IO。",
        "数据全部放在叶子层，而且叶子之间用双向链表串起来，所以范围查询只要定位到起点，顺着链表往后扫就行，不用回头遍历树。",
        "二叉树或红黑树每个节点只有两个孩子，百万行数据树高二十多层，等于二十多次磁盘 IO，完全不能接受。",
        "哈希索引等值查找确实是 O(1)，但不支持范围查询、不支持排序、也不支持最左前缀，用途太窄。",
        "普通 B 树的非叶子节点也存数据，每页能放的键就变少了，树会更高；而且叶子之间没有链表，范围查询要不停回溯。"
      ], {
        diagramSteps: [
          "把树高直接理解成磁盘 IO 次数，这是理解整个设计的钥匙。",
          "根节点是一个页，里面全是键，比如 10、40、80。",
          "按查找的键落在哪个区间，往下一层对应的子节点走。",
          "中间层同样只存键，继续缩小范围。",
          "到叶子层才真正拿到数据，整个过程只走了三层。",
          "如果是范围查询，定位到起点后直接沿叶子链表顺序扫，不再需要回到上层。"
        ],
        pitfalls: [
          "只说「B+ 树查得快」而不提磁盘和页，等于没答到点子上。",
          "混淆 B 树和 B+ 树，说不清「数据只在叶子」这个关键差别。",
          "以为哈希索引一无是处，其实等值查找场景下 Memory 引擎和自适应哈希索引都在用。",
          "忘了叶子链表这个设计，导致解释不了为什么 ORDER BY 和范围查询能借上索引的力。"
        ],
        complexity: [
          "答题顺序建议：先讲磁盘前提，再讲扇出和树高，最后讲叶子链表，逻辑链完整。",
          "能顺带对比二叉树、哈希、B 树三种替代方案各自的问题，回答就很饱满了。"
        ]
      }),
      q("db-clustered-index", "intermediate", true, "什么是回表？覆盖索引为什么能省掉它？", ["聚簇索引", "二级索引", "回表", "覆盖索引"], [
        "InnoDB 里数据本身就存在主键索引的叶子上，这棵树叫聚簇索引；在别的字段上建的索引叫二级索引，它的叶子存的不是数据，而是主键值。",
        "所以用二级索引查数据要走两棵树：先在二级索引上找到主键，再拿主键去聚簇索引上取整行 —— 这一步就叫回表。",
        "如果查询要的列刚好都在二级索引里，第一棵树上就有答案，不用回表，这就是覆盖索引，EXPLAIN 的 Extra 里会显示 Using index。",
        "由此推出两条实务经验：一是主键要短，因为每个二级索引的叶子都要存一份主键，主键越大索引越占空间；二是别习惯性写 SELECT *，它逼着数据库必须回表。",
        "也解释了为什么推荐自增主键：聚簇索引按主键顺序排列，自增意味着新行追加在末尾；用 UUID 这种随机主键会插到中间，导致页分裂和大量随机 IO。"
      ], {
        diagramSteps: [
          "先记住两棵树的分工：聚簇索引叶子放整行数据，二级索引叶子只放主键。",
          "执行「查张三的余额」：先在姓名索引上定位到「张三 → 主键 1024」。",
          "二级索引里没有余额这一列，所以必须拿着 1024 再去聚簇索引查一次。",
          "第二次查找拿到整行，才能取出余额 —— 这就是回表的代价。",
          "如果查的是「张三的主键」，第一棵树上就有，直接返回，不用回表。",
          "把常一起查询的列做成联合索引，就能把更多查询变成覆盖索引。"
        ],
        pitfalls: [
          "习惯性写 SELECT *，让本来可以覆盖的查询被迫回表。",
          "用 UUID 或雪花 ID 之外的随机字符串做主键，引起页分裂和索引膨胀。",
          "主键设计得很长（比如用长字符串），所有二级索引都跟着变大。",
          "以为建了索引就一定快，忽略了回表本身也是随机 IO，命中行数多时反而不如全表扫。"
        ],
        cppCode: "-- 需要回表：amount 不在 idx_account 里\nSELECT amount FROM trade WHERE account_id = 1001;\n\n-- 覆盖索引：要的列都在联合索引里，Extra 显示 Using index\nALTER TABLE trade ADD INDEX idx_account_amount (account_id, amount);\nSELECT amount FROM trade WHERE account_id = 1001;\n",
        complexity: [
          "回表这个概念是二级索引一切取舍的根源，讲清它，覆盖索引和主键设计都能顺势带出来。",
          "面试里能主动说出「所以别写 SELECT *」，比空谈规范更有说服力。"
        ]
      }),
      q("db-composite-index", "intermediate", true, "联合索引的最左前缀是什么意思？列顺序该怎么定？", ["联合索引", "最左前缀", "索引设计"], [
        "最左前缀不是一条需要背的规则，而是排序方式的必然结果。",
        "联合索引 (省, 市, 区) 就是先按省排序，省相同再按市排，市也相同才按区排 —— 和通讯录一样。",
        "所以查「浙江的」很快，查「浙江杭州的」也很快；但查「所有西湖区的」就不行，因为区名在整本通讯录里是散乱的，二分查找无从下手。",
        "列顺序的设计原则：区分度高的、以及等值查询的列放前面，范围查询的列放最后。",
        "因为范围条件之后的列就用不上索引了：WHERE a = 1 AND b > 10 AND c = 5 这条查询里，索引只能用到 a 和 b，c 排不上用场。"
      ], {
        diagramSteps: [
          "把联合索引想象成一张按多列排好序的表。",
          "第一列在全局是有序的，所以任何时候都能二分。",
          "第二列只有在第一列相同的那一小段里才有序。",
          "第三列则要前两列都相同才有序。",
          "查询条件如果跳过了第一列，后面那列在全局是乱的，索引就用不上。",
          "一旦某一列用了范围条件，它后面的列也就失去有序性，只能作为过滤条件而非查找条件。"
        ],
        pitfalls: [
          "为每个字段单独建索引，以为组合起来就能用，实际上多数情况只会用上其中一个。",
          "把范围查询的列放在联合索引前面，导致后面的列全部失效。",
          "把区分度极低的列（如状态、性别）放在最前面，索引几乎没有筛选能力。",
          "建了大量重复索引，比如同时有 (a) 和 (a, b)，前者完全是冗余的，白白拖慢写入。"
        ],
        cppCode: "-- 联合索引 (account_id, trade_time)\nALTER TABLE trade ADD INDEX idx_account_time (account_id, trade_time);\n\nWHERE account_id = 1001                          -- 用得上\nWHERE account_id = 1001 AND trade_time > '...'   -- 用得上，且能省掉排序\nWHERE trade_time > '...'                         -- 跳过了第一列，用不上\n\n-- (a) 是 (a, b) 的前缀，属于冗余索引，可以删掉\n",
        complexity: [
          "用通讯录或字典的比喻来讲，比背「最左前缀原则」这五个字有效得多。",
          "能主动提到「范围列放最后」和「冗余索引」，说明有真实的索引设计经验。"
        ]
      }),
      q("db-index-invalid", "basic", true, "哪些写法会导致索引失效？", ["索引失效", "隐式转换", "函数"], [
        "所有失效场景本质上只有一句话：你比较的东西，不再是索引里排好序的那个东西。",
        "对字段套函数或做运算，比如 WHERE DATE(create_time) = ?，算出来的结果在索引树上不再有序，只能逐行算一遍，退化成全表扫。改法是把运算挪到常量那一侧，用范围比较代替。",
        "前导模糊匹配 LIKE '%三' 用不上索引，因为不知道开头就没法在有序目录里定位；LIKE '三%' 则可以。",
        "隐式类型转换是最隐蔽的一种：字段是字符串却传了数字，数据库会把字段转成数字再比，等于给字段套了函数。",
        "OR 连接的条件里只要有一列没索引，整条就只能全表扫，可以改写成 UNION 或给两列都建索引。",
        "还有一种不算失效的情况：索引区分度太低时，优化器会主动放弃它 —— 因为回表的随机 IO 比顺序全表扫更贵，这个决定通常是对的。"
      ], {
        diagramSteps: [
          "先记住索引的本质：一份按字段原值排好序的目录。",
          "直接比较原值，可以在目录上二分，几次跳转就定位。",
          "一旦给字段套上函数，比较的对象变成了计算结果，而目录不是按结果排序的。",
          "数据库没有别的办法，只能把每一行都取出来算一遍再判断，这就是全表扫。",
          "隐式类型转换是同一个道理，只是那层函数是数据库偷偷加上的，更难发现。",
          "拿不准的时候不要猜，直接 EXPLAIN 跑一遍看 key 和 type。"
        ],
        pitfalls: [
          "把网上流传的「索引失效十八条」当成死规则背，其中不少是过时或有条件的。",
          "忽略隐式类型转换，字段是 varchar 却传数字参数，索引悄悄失效且很难察觉。",
          "以为优化器不走索引就是它出错了，实际上命中行数太多时全表扫确实更快。",
          "统计信息过期导致优化器估算失准，选错索引，可以用 ANALYZE TABLE 更新。"
        ],
        cppCode: "-- 失效：字段被函数包住\nWHERE DATE(create_time) = '2026-01-01'\n-- 改写：范围比较，索引可用\nWHERE create_time >= '2026-01-01' AND create_time < '2026-01-02'\n\n-- 失效：phone 是 varchar，传了数字会触发隐式转换\nWHERE phone = 13800000000\n-- 改写：保持类型一致\nWHERE phone = '13800000000'\n\n-- 拿不准就直接看执行计划\nEXPLAIN SELECT ...;\n",
        complexity: [
          "用「比较对象不再是排好序的那个值」这一句话概括所有场景，比罗列条目更能说明你真懂。",
          "面试里主动加一句「拿不准就 EXPLAIN」，显得务实。"
        ]
      }),
      q("db-explain", "intermediate", true, "慢查询怎么优化？EXPLAIN 主要看哪几列？", ["EXPLAIN", "慢查询", "执行计划"], [
        "标准流程分五步，缺了最后一步就不完整。",
        "第一步用慢查询日志定位到具体是哪条 SQL，不要凭感觉猜。",
        "第二步 EXPLAIN 看执行计划，重点是四列：type 是访问方式，从好到坏是 const、eq_ref、ref、range、index、ALL，看到 ALL 就是全表扫；key 是实际用了哪个索引，为 NULL 说明一个都没用上；rows 是预估扫描行数，和最终返回行数差距越大说明白扫的越多；Extra 里 Using index 表示覆盖索引很好，出现 Using filesort 或 Using temporary 通常就是要优化的信号。",
        "第三步按最左前缀和覆盖索引的思路调整索引，或者改写 SQL 让条件能用上索引。",
        "第四步回头看是不是本身就返回了太多数据 —— 该分页的分页，该聚合的聚合，有时候问题不在索引而在需求。",
        "第五步改完再 EXPLAIN 和压测一次做前后对比，这一步最容易被忘，但没有对比就说不清到底优化没优化。"
      ], {
        diagramSteps: [
          "开启慢查询日志，设好阈值，让问题 SQL 自己浮出来。",
          "对可疑 SQL 执行 EXPLAIN，先看 type 那一列。",
          "如果是 ALL，说明全表扫，优先考虑加索引或改写条件。",
          "再看 key 是否为空、rows 是否远大于实际返回行数。",
          "最后看 Extra，出现 filesort 说明排序没能借上索引的力，可以考虑让联合索引的顺序和 ORDER BY 一致。",
          "改完重新 EXPLAIN，并在接近生产的数据量上压测验证。"
        ],
        pitfalls: [
          "只在小数据量的测试库上验证，优化器在数据量变化后可能选完全不同的计划。",
          "只看 SQL 执行时间不看扫描行数，掩盖了潜在的全表扫。",
          "一看到慢就加索引，索引过多会明显拖慢写入并占用大量空间。",
          "忽略 Using filesort，其实很多排序可以靠调整联合索引顺序直接消掉。",
          "优化完不做前后对比，无法证明改动有效，也无法防止回退。"
        ],
        cppCode: "EXPLAIN SELECT id, amount FROM trade\n WHERE account_id = 1001 AND trade_time >= '2026-01-01'\n ORDER BY trade_time;\n\n-- 理想结果：\n--   type  = range\n--   key   = idx_account_time\n--   Extra = Using index      （覆盖索引，不用回表）\n--   且没有 Using filesort    （索引本身有序，排序被省掉）\n",
        complexity: [
          "这题考的是流程而不是知识点，按五步讲能显得体系化。",
          "把「改完再对比一次」说出来，是区分做过和没做过的细节。"
        ]
      }),
      q("db-redo-binlog", "advanced", false, "redo log、undo log 和 binlog 分别是干什么的？", ["redo", "undo", "binlog", "两阶段提交"], [
        "三个日志分工完全不同，最容易混，要分开记。",
        "undo log 记录的是「怎么撤销」，服务于原子性和 MVCC —— 回滚靠它，读旧版本也靠它。",
        "redo log 记录的是「某个数据页要改成什么样」，服务于持久性。它是 InnoDB 引擎层的、循环写、顺序追加，作用是崩溃恢复。",
        "binlog 记录的是逻辑上的数据变更，是 MySQL Server 层的、追加写，任何存储引擎都有，服务于主从复制和备份恢复。",
        "提交时用两阶段提交把 redo 和 binlog 绑在一起：先把 redo 写成 prepare 状态，再写 binlog，最后把 redo 标记为 commit。",
        "崩溃恢复时的判断是：redo 已经是 commit 就直接生效；只到 prepare，就去看 binlog 完整不完整，完整就补提交，不完整就回滚。这样才能保证主库数据和从库收到的日志永远一致。"
      ], {
        diagramSteps: [
          "执行一条 UPDATE：先写 undo 记下怎么撤销，再改内存里的数据页，然后写 redo。",
          "注意此时磁盘上的数据文件还没动，改的只是内存页和日志。",
          "COMMIT 时进入两阶段：先把 redo 刷盘并标记 prepare。",
          "接着写 binlog 并刷盘。",
          "最后把 redo 标记成 commit，事务才真正算提交。",
          "脏页由后台线程择机批量刷回磁盘，把随机写摊平。"
        ],
        pitfalls: [
          "把 redo 和 binlog 混为一谈，说不清一个是物理日志一个是逻辑日志、一个是引擎层一个是 Server 层。",
          "以为提交就等于数据文件写完了，其实只保证日志落盘。",
          "不理解两阶段提交的必要性：如果不用，两个日志之间断电就会出现主从数据不一致，而且事后无法察觉。",
          "把 sync_binlog 和 innodb_flush_log_at_trx_commit 调成非安全值换性能，宕机时会真的丢数据。"
        ],
        cppCode: "-- 这两个参数决定了你能承受多大的丢数据风险\nSHOW VARIABLES LIKE 'innodb_flush_log_at_trx_commit';  -- 1 = 每次提交都刷盘，最安全\nSHOW VARIABLES LIKE 'sync_binlog';                     -- 1 = 每次提交都刷 binlog\n\n-- 看 redo 和 binlog 的当前位置\nSHOW ENGINE INNODB STATUS;\nSHOW MASTER STATUS;\n",
        complexity: [
          "这题属于加分题，能答清楚说明看过原理而不只是会用。",
          "记忆口诀：undo 管回滚和旧版本，redo 管崩溃恢复，binlog 管复制和备份。"
        ]
      }),
      q("db-index-tradeoff", "intermediate", true, "索引是不是越多越好？什么时候不该建索引？", ["索引取舍", "写放大", "区分度"], [
        "不是。索引的本质是用空间和写入代价换查询速度，这笔交易并不总是划算。",
        "每加一个索引，所有 INSERT、UPDATE、DELETE 都要额外维护一棵 B+ 树，写入变慢、页分裂变多、表空间变大。",
        "区分度太低的列不该建，比如性别或状态：命中一半的行，回表的随机 IO 比直接全表顺序扫还贵，优化器多半也会放弃它。",
        "数据量很小的表不该建，几百行的表全表扫本来就是一次页读取，加索引反而多一层间接。",
        "冗余索引要清理：已经有 (a, b) 就不需要再单独建 (a)，因为前者的前缀已经覆盖了后者。",
        "写多读少的表要克制，比如流水日志表，只在真正被查询的字段上建索引。"
      ], {
        diagramSteps: [
          "先算清楚这笔交易：查询收益 vs 写入成本 + 空间成本。",
          "看这个字段是否真的经常出现在查询条件里 —— 没人查的字段建了也是白建。",
          "看区分度：用 count(distinct 列) / count(*) 估算，太接近 0 就没有筛选意义。",
          "看表的读写比：写多读少的表要格外克制。",
          "检查是否已被现有联合索引的前缀覆盖，避免建冗余索引。",
          "上线后回头看索引使用情况，把从来没被用过的索引删掉。"
        ],
        pitfalls: [
          "一遇到慢查询就加索引，久而久之一张表十几个索引，写入性能严重下降。",
          "在低区分度字段上建索引，占了空间还用不上。",
          "忘了联合索引的前缀已经覆盖了单列索引，重复建造。",
          "只关注加索引，从不清理已经无用的索引。",
          "在导入大批量数据前不禁用索引，导致导入过程极慢。"
        ],
        cppCode: "-- 估算区分度，越接近 1 越值得建索引\nSELECT COUNT(DISTINCT status) / COUNT(*) FROM trade;\n\n-- 找出从未被使用过的索引（performance_schema 需开启）\nSELECT object_name, index_name\n  FROM performance_schema.table_io_waits_summary_by_index_usage\n WHERE index_name IS NOT NULL AND count_star = 0;\n",
        complexity: [
          "这题考的是工程判断力，面试官想听的是取舍而不是「索引能加速查询」。",
          "能主动提到清理无用索引和低区分度字段，会显得有维护经验。"
        ]
      })
    ],
    "恒生 / 知识直讲": [
      q("hs-knowledge-memory-trading", "intermediate", true, "全内存交易系统到底是什么？该怎么建立学习心智模型？", ["恒生", "全内存交易", "知识直讲", "架构"], [
        "先把它理解成：把账户、持仓、委托、成交等热数据尽量放在进程内存里处理，关键路径尽量不碰磁盘随机读写。",
        "目标不是“所有数据永远不落盘”，而是“交易热路径以内存为准，磁盘负责持久化、恢复与审计”。",
        "相对传统库表驱动路径，它用更短的数据访问路径换低延迟；代价是恢复、容量、一致性设计更难。",
        "学习时按四层记：内存态数据结构 → 状态机与并发 → 持久化/日志/快照 → 故障恢复与对账。",
        "面试或自学都要能讲清：快从哪里来、对从哪里保证、挂了怎么恢复。"
      ], {
        diagramSteps: [
          "客户下单进入网关后，先做校验与风控，再进入核心交易进程。",
          "核心进程在内存里查找账户/持仓，更新委托状态，必要时触发报盘。",
          "回报/成交回来后，仍先改内存态，再异步或同步写日志/落库。",
          "若进程崩溃，靠日志重放 + 快照把内存态重建到一致点。",
          "最后用对账核对内存态、日志、外部回报是否闭环。"
        ],
        pitfalls: [
          "把“全内存”理解成完全不需要持久化——那是赌博，不是交易系统。",
          "只优化平均延迟，不看尾延迟和故障恢复时间。",
          "内存结构设计时忽略分片、锁粒度与伪共享，导致快不起来。"
        ],
        complexity: [
          "这是架构理解题，不考算法复杂度。",
          "继续深入可学：预写日志(WAL)、快照、主备切换、按账户分片。"
        ]
      }),
      q("hs-knowledge-order-lifecycle", "intermediate", true, "委托从下单到成交，状态怎么流转？为什么要学状态机？", ["委托", "状态机", "成交", "知识直讲"], [
        "把每笔委托当成有限状态机：新建 → 已报/已确认 → 部成/全成 → 已撤/废单等终态。",
        "每个回报、撤单、超时都是一次状态迁移；非法迁移必须拒绝，否则会出现重复记账。",
        "部分成交要能累计成交量，并决定剩余量是否继续有效。",
        "学习价值：很多线上错单，根因都是状态迁移漏边界，而不是单纯语法错误。",
        "实现上建议：显式状态枚举 + 合法迁移表 + 幂等键（委托号/成交号）。"
      ], {
        diagramSteps: [
          "客户提交委托，系统生成委托号，进入“待报/已受理”。",
          "报盘成功后进入“已报”，等待交易所/对手方回报。",
          "收到成交回报：更新成交明细、累加数量，可能进入“部成”或“全成”。",
          "收到撤单成功或废单：进入对应终态，释放冻结资金/持仓。",
          "任何重复回报都先查幂等，再决定是否允许迁移。"
        ],
        pitfalls: [
          "用散落的 if-else 隐式改状态，后续没人敢动。",
          "忽略乱序回报：先到成交后到确认，或重复成交号。",
          "终态后又被二次修改，造成资金持仓不一致。"
        ],
        cppCode: [
          "#include <string>",
          "#include <unordered_set>",
          "",
          "enum class OrderStatus { New, Sent, Partial, Filled, Canceled, Rejected };",
          "",
          "struct Order {",
          "    std::string id;",
          "    OrderStatus status = OrderStatus::New;",
          "    int qty = 0;",
          "    int filled = 0;",
          "};",
          "",
          "bool applyFill(Order& order, int fillQty, const std::string& execId,",
          "               std::unordered_set<std::string>& seenExec) {",
          "    if (!seenExec.insert(execId).second) {",
          "        return false; // 重复成交回报，直接幂等返回",
          "    }",
          "    if (order.status == OrderStatus::Canceled ||",
          "        order.status == OrderStatus::Rejected ||",
          "        order.status == OrderStatus::Filled) {",
          "        return false; // 终态不可再成交",
          "    }",
          "    order.filled += fillQty;",
          "    order.status = (order.filled >= order.qty)",
          "        ? OrderStatus::Filled",
          "        : OrderStatus::Partial;",
          "    return true;",
          "}"
        ].join("\n"),
        complexity: [
          "单笔迁移是 O(1) 思路；工程难点在并发下的正确性与对账。",
          "可继续补：按账户串行队列，避免同一账户状态被多线程交错修改。"
        ]
      }),
      q("hs-knowledge-memory-raii", "intermediate", true, "交易服务里如何系统学习 C++ 内存管理与 RAII？", ["内存管理", "RAII", "智能指针", "知识直讲"], [
        "先分清三类问题：谁拥有资源、何时释放、异常/提前返回会不会漏释放。",
        "RAII 的核心：构造拿资源，析构还资源，让生命周期跟着作用域走。",
        "现代默认：unique_ptr 表独占，shared_ptr 表共享，容器/字符串自己管内存。",
        "热路径上还要学：减少分配次数、对象池、避免无意义拷贝、关注缓存局部性。",
        "排查内存：先定性（泄漏/缓存/碎片），再定位模块，最后用工具验证。"
      ], {
        diagramSteps: [
          "裸 new/delete：每个成功路径和失败路径都要自己配对，一处漏就漏。",
          "改成 RAII 后：对象离开作用域自动析构，return/抛异常也能清理。",
          "unique_ptr 把所有权绑在一个所有者上；转移所有权用移动，不靠拷贝。",
          "shared_ptr 用引用计数共享；环状引用时要 weak_ptr 打断。",
          "线上上涨时：先看是否有上限配置，再看对象计数是否只增不减。"
        ],
        pitfalls: [
          "把 shared_ptr 当默认选择，导致生命周期纠缠、性能变差。",
          "异步回调引用捕获局部对象或 this，造成 use-after-free。",
          "只看 RSS 上涨就断定泄漏，忽略合法缓存增长。"
        ],
        cppCode: [
          "#include <memory>",
          "#include <vector>",
          "",
          "struct Buffer {",
          "    explicit Buffer(std::size_t n) : data(n) {}",
          "    std::vector<char> data;",
          "};",
          "",
          "void handleRequest() {",
          "    // 独占所有权：离开作用域自动释放",
          "    auto buf = std::make_unique<Buffer>(4096);",
          "    // 使用 buf->data ...",
          "    // 无需手动 delete",
          "}"
        ].join("\n")
      }),
      q("hs-knowledge-linux-gdb", "intermediate", true, "Linux 服务排障和 gdb，应该按什么路径学？", ["Linux", "gdb", "core", "知识直讲"], [
        "先建立分类：CPU 高、内存涨、卡住、崩溃、连不上，不同类型用不同命令。",
        "进程视角：ps/top/pidstat；资源：free/vmstat/iostat；连接：ss/lsof。",
        "gdb 基础闭环：断点 → 跑起来 → backtrace → 打变量 → 切线程看栈。",
        "崩溃学习重点：如何保留 core、如何用匹配的二进制+符号表分析。",
        "目标不是背命令，而是形成“现象 → 假设 → 取证 → 验证”的习惯。"
      ], {
        diagramSteps: [
          "看到 CPU 高：top 找进程/线程 → perf/火焰图看热点函数。",
          "看到内存涨：先判断泄漏还是缓存 → 再看增长曲线与模块开关。",
          "看到卡住：ss/lsof 看连接与句柄，pstack/gdb 看是否死锁等待。",
          "看到崩溃：确认 core 文件 → gdb ./app core → bt full 定位。",
          "最后把根因沉淀成单测/回归，避免只修表象。"
        ],
        pitfalls: [
          "一上来就 strace 全量跟踪，热路径被拖死还误判。",
          "core 与二进制版本不一致，导致栈完全不可信。",
          "只看主线程，忽略工作线程里的死锁或崩溃点。"
        ],
        complexity: [
          "建议动手练：写一个必崩小程序，自己生成并分析 core。",
          "再练：多线程死锁样例，用 thread apply all bt 观察等待环。"
        ]
      }),
      q("hs-knowledge-concurrency", "intermediate", true, "多线程/多进程在交易服务里该怎么学才不乱？", ["多线程", "多进程", "锁", "知识直讲"], [
        "先问目标：要隔离故障，还是要共享低延迟通信？这决定进程/线程偏向。",
        "线程共享地址空间，通信便宜但数据竞争风险高；进程隔离强，通信成本更高。",
        "同步工具按需：mutex 护不变量，条件变量做等待通知，atomic 做轻量标志/计数。",
        "进阶重点：锁顺序、锁粒度、伪共享、按账户串行化、无锁队列的适用边界。",
        "正确性永远先于炫技无锁；先保证不变量，再谈性能。"
      ], {
        diagramSteps: [
          "画出共享状态：哪些数据会被多线程同时读写。",
          "给每份共享状态定义不变量，例如“filled 不超过 qty”。",
          "选择保护方式：一把锁护一组字段，或把同账户请求丢进单线程队列。",
          "压测观察：吞吐、尾延迟、CPU、锁等待是否异常。",
          "用 TSan/复现脚本验证是否还有数据竞争。"
        ],
        pitfalls: [
          "多个 atomic 拼业务操作，看起来并发安全，实际破坏了多字段不变量。",
          "锁嵌套无固定顺序，偶发死锁难复现。",
          "线程池任务阻塞导致工作线程耗尽，关键路径也被拖死。"
        ],
        cppCode: [
          "#include <mutex>",
          "#include <unordered_map>",
          "#include <string>",
          "",
          "class AccountBook {",
          "public:",
          "    void addCash(const std::string& account, long delta) {",
          "        std::lock_guard<std::mutex> lock(mu_);",
          "        cash_[account] += delta; // 保护的是整个 map 不变量",
          "    }",
          "",
          "private:",
          "    std::mutex mu_;",
          "    std::unordered_map<std::string, long> cash_;",
          "};"
        ].join("\n")
      }),
      q("hs-knowledge-db-txn-index", "intermediate", true, "事务、隔离级别、索引，怎么结合交易场景学？", ["事务", "ACID", "索引", "隔离级别", "知识直讲"], [
        "ACID 先抓业务含义：一组记账动作不能只成功一半。",
        "隔离级别决定并发下能看到什么异常：脏读、不可重复读、幻读。",
        "索引加速查找，但会增加写成本；要看查询模式和选择性。",
        "交易系统常是“内存态做热路径，数据库做持久化/查询/清算”，两层都要懂一致性边界。",
        "幂等与事务经常一起出现：重复消息下也不能重复扣款。"
      ], {
        diagramSteps: [
          "一笔成交记账：更新成交明细、持仓、资金，三者应同进同退。",
          "若用数据库事务：BEGIN → 写多表 → COMMIT；失败则 ROLLBACK。",
          "若热路径在内存：先改内存，再写 WAL；恢复时按日志重放保证同样原子语义。",
          "查询历史委托时，合理索引（如 account_id + order_time）避免全表扫。",
          "用对账任务定期核对内存、DB、外部流水。"
        ],
        pitfalls: [
          "只会背 ACID 定义，说不清和“扣款成功但持仓没加”的关系。",
          "给低选择性字段滥建索引，写入变慢且收益很小。",
          "忽略隔离级别差异，并发下出现“看到中间态”。"
        ],
        complexity: [
          "学习顺序建议：ACID → 隔离异常现象 → 索引结构直觉 → 幂等与对账。",
          "不必一上来深挖某种数据库引擎源码，先把业务正确性讲清楚。"
        ]
      }),
      q("hs-knowledge-perf-tuning", "advanced", true, "系统性能调优应该怎么学，才能用到交易链路上？", ["性能调优", "profiling", "尾延迟", "知识直讲"], [
        "先定义指标：吞吐、平均延迟、P99/P999 尾延迟、CPU、失败率。",
        "没有基线就没有优化；先测量，再改，再对比，并保证正确性回归。",
        "定位顺序：关键路径画像 → 区分计算/锁/分配/IO/系统调用 → 做最小改动。",
        "常见手段：减少拷贝与分配、批处理、绑核、控制锁竞争、改善数据布局。",
        "交易场景特别要防：优化把顺序语义或记账正确性弄坏。"
      ], {
        diagramSteps: [
          "选定场景：例如单账户连续下单，或高峰回报风暴。",
          "打点记录关键阶段耗时：入网关、风控、撮合/报盘、回报处理。",
          "用 perf/火焰图看热点，提出“只改一处”的假设。",
          "改完后看 P99 是否下降，且成交/资金对账仍正确。",
          "把方法和数据写成复盘，形成可重复的调优清单。"
        ],
        pitfalls: [
          "只看平均值，尾巴延迟其实恶化。",
          "过早微优化，却没先去掉同步磁盘或多余日志刷盘。",
          "没有正确性门禁，性能数字好看但账不平。"
        ]
      }),
      q("hs-knowledge-brokerage-basics", "basic", true, "经纪业务（股债基/大宗）需要先补哪些业务知识？", ["经纪业务", "股债基", "大宗交易", "知识直讲"], [
        "先掌握主链路：下单 → 校验/风控 → 报盘 → 回报 → 成交回写 → 资金持仓更新。",
        "股、债、基的共性是委托成交与资产变更；差异在交易规则、费用、交收与风控口径。",
        "大宗交易往往有独立申报/确认路径，不要假设和普通竞价完全一样。",
        "学习方法：用一张时序图 + 一张状态图，把“正常流/异常流”画出来。",
        "对开发来说，业务知识的价值是能把规则落成校验、状态机和测试用例。"
      ], {
        diagramSteps: [
          "画正常流：投资者下单到最终持仓变化。",
          "补异常流：废单、撤单、部成、超时、重复回报。",
          "标出系统边界：哪些在券商侧，哪些依赖交易所/柜台回报。",
          "把差异规则（品种、大宗）写成可配置策略或独立模块。",
          "用样例委托数据做回放，验证你的理解是否可执行。"
        ],
        pitfalls: [
          "背一堆术语却画不出主链路。",
          "把所有品种做成复制粘贴代码，差异散落各处。",
          "忽略费用、冻结、解冻这些和资金强相关的细节。"
        ],
        complexity: [
          "建议结合公开的证券交易基础概念学习，不需要也不应依赖任何机密实现细节。",
          "能讲清主链路和差异点，就已经能支撑大多数面试业务问答。"
        ]
      }),
      q("hs-knowledge-module-design", "intermediate", true, "接到一个交易模块，如何做可学习、可表达的方案设计？", ["模块设计", "系统设计", "方案", "知识直讲"], [
        "固定表达模板：背景与目标 → 用例 → 数据与状态 → 并发与失败 → 验证方式。",
        "先写清输入输出和非功能指标（延迟、吞吐、可用性），再选技术点。",
        "把风险前置：重复消息、乱序、时钟、部分失败、回滚策略。",
        "验证闭环：单测覆盖状态迁移、回放样本、压测、对账。",
        "这样既利于自己学习落地，也利于面试时结构化表达。"
      ], {
        diagramSteps: [
          "用 5 分钟写清：这个模块解决什么问题，成功标准是什么。",
          "列出 3 个正常用例和 5 个异常用例。",
          "画出核心对象与状态迁移，标出幂等键。",
          "选择进程内模型（单线程队列/加锁/分片）并说明取舍。",
          "给出测试与上线观察指标，形成可执行计划。"
        ],
        pitfalls: [
          "一上来堆中间件名词，却说不清状态与失败语义。",
          "没有验收口径，做完了也不知道对不对。",
          "设计文档和代码脱节，状态机只存在于口头。"
        ]
      })
    ],
    "恒生 / 岗位与业务": [
      q("hs-biz-role", "basic", true, "你怎么理解恒生经纪业务 C++ 开发工程师这个岗位？", ["恒生", "经纪业务", "岗位理解"], [
        "这个岗位核心是参与证券经纪相关交易系统的设计与开发，技术栈偏 C++ / Linux 服务端。",
        "从 JD 看，不只是写功能，还要逐步承担模块方案、编码、单测和问题排查。",
        "业务侧会接触买卖交易、资金持仓、委托成交等链路，所以技术表达最好能落到业务闭环。",
        "面试里可以说：我理解这是“高性能交易系统工程能力 + 愿意钻研业务”的组合岗位。"
      ]),
      q("hs-biz-memory-trading", "intermediate", true, "什么是全内存交易系统？它相对磁盘型系统有什么取舍？", ["全内存交易", "低延迟", "取舍"], [
        "全内存交易系统把核心账户、持仓、委托等热数据尽量放在内存中，减少磁盘 IO 对关键路径的干扰。",
        "收益是延迟更低、吞吐更高，更适合交易撮合/报盘/风控等对时延敏感的链路。",
        "代价是内存容量、宕机恢复、持久化与一致性设计更复杂，不能只谈快不谈可靠。",
        "回答时最好补一句：真正工程难点往往是“快”和“正确可恢复”同时成立。"
      ]),
      q("hs-biz-brokerage", "basic", true, "证券经纪业务里，常见的委托成交链路大致怎么走？", ["经纪业务", "委托", "成交"], [
        "典型链路是：客户下单 → 校验与风控 → 报盘/路由 → 交易所回报 → 成交回写 → 持仓资金更新。",
        "中间会穿插委托状态机、幂等、超时重试、部分成交和废单处理。",
        "面试不用背完整交易细则，但要能讲清关键节点和状态流转。",
        "如果继续追问，可落到：你如何保证回报乱序或重复时仍能正确记账。"
      ]),
      q("hs-biz-stock-bond-fund", "basic", true, "股、债、基买卖在系统实现上可能有哪些共性与差异？", ["股债基", "证券业务", "交易品种"], [
        "共性通常是委托、成交、持仓、资金、费用和清算这些核心对象都存在。",
        "差异可能体现在交易规则、交收周期、费用计算、可用额度与风控口径上。",
        "系统设计上常把公共交易能力抽象出来，再按品种扩展差异规则。",
        "加分答法是：先找共性模型，再隔离差异，避免每个品种复制一套系统。"
      ]),
      q("hs-biz-block-trade", "intermediate", false, "大宗交易和普通竞价交易在系统视角上有什么不同？", ["大宗交易", "经纪业务"], [
        "大宗交易通常面向大额、特定对手或特定时段规则，撮合/申报路径可能不同于连续竞价。",
        "系统侧更关注额度校验、对手方确认、特殊申报字段和事后清算口径。",
        "它往往不是简单改个参数，而可能是独立业务通道或差异化状态机。",
        "面试里体现你知道“业务规则不同会驱动接口与校验不同”即可。"
      ]),
      q("hs-biz-why-hundsun", "basic", true, "如果问你为什么想做证券交易系统软件，怎么答更稳？", ["动机", "交易系统", "恒生"], [
        "可以从技术深度出发：低延迟、高可靠、强一致的服务端系统很锻炼工程能力。",
        "再落到业务价值：交易系统直接服务真实资金与订单，正确性与稳定性要求高。",
        "最后对接个人优势：C++、Linux、并发与排障能力，以及愿意钻研业务规则。",
        "避免空泛夸公司，重点讲“我能贡献什么、我为什么适合这个方向”。"
      ]),
      q("hs-biz-domain-learn", "basic", true, "没有深厚证券背景时，你怎么快速补齐业务理解？", ["业务学习", "领域知识"], [
        "先建立主链路心智模型：下单、风控、报盘、回报、成交、持仓资金。",
        "再针对岗位相关品种补规则差异，而不是一开始背全市场细则。",
        "开发时把业务规则写成可验证用例，用单测/联调样例固化理解。",
        "面试官更看重学习路径和把业务转成设计的能力，而不是术语堆砌。"
      ])
    ],
    "恒生 / C++与内存": [
      q("hs-cpp-lang-base", "basic", true, "面向交易系统服务端，你认为 C/C++ 最需要扎实的基础点有哪些？", ["C++", "基础", "交易系统"], [
        "内存模型与对象生命周期、RAII、异常安全是底盘，决定资源会不会漏、会不会野。",
        "容器选型、拷贝/移动代价、缓存友好布局，会直接影响热路径性能。",
        "多线程下的数据竞争、原子与锁的边界，是服务端几乎绕不开的题。",
        "答题时最好强调：语法会写不够，要能把语言特性和延迟/正确性目标连起来。"
      ]),
      q("hs-cpp-memory-mgmt", "basic", true, "你怎么理解服务端开发里的“内存管理”？", ["内存管理", "RAII", "泄漏"], [
        "不只是 new/delete，还包括对象归属、缓存上限、内存池和碎片控制。",
        "现代 C++ 优先用 RAII 与智能指针管理生命周期，减少手工释放路径。",
        "热路径上还要关心分配频率、大对象拷贝和内存局部性。",
        "交易系统里内存问题往往同时伤害性能和稳定性，所以要双线看。"
      ]),
      q("hs-cpp-raii", "intermediate", true, "为什么交易系统这类长驻服务特别强调 RAII？", ["RAII", "资源", "异常安全"], [
        "长驻进程一旦泄漏或锁未释放，会随时间放大成稳定性事故。",
        "RAII 把资源释放绑到作用域结束，return/异常路径更不容易漏清理。",
        "它覆盖内存、锁、文件描述符、socket 等广义资源。",
        "面试可补一句：热路径里仍要评估 RAII 对象的构造析构开销，但正确性优先。"
      ]),
      q("hs-cpp-smart-ptr", "intermediate", true, "在性能敏感模块里，智能指针该怎么选？", ["unique_ptr", "shared_ptr", "性能"], [
        "默认优先 unique_ptr，所有权清晰、开销小。",
        "只有确实需要共享生命周期时才用 shared_ptr，并警惕循环引用。",
        "热路径里甚至可能用对象池/预分配，避免频繁堆分配。",
        "好的回答会区分“接口表达所有权”和“极致性能路径的分配策略”。"
      ]),
      q("hs-cpp-copy-cost", "intermediate", true, "热路径上如何减少不必要的拷贝？", ["拷贝", "移动", "性能"], [
        "传参优先 const 引用或移动语义，避免大对象按值传递。",
        "容器预留容量、就地构造、避免隐式临时对象。",
        "必要时用自定义缓冲或环形队列，减少动态扩容带来的拷贝。",
        "先用 profiling 证明拷贝是热点，再优化，避免过早微操。"
      ]),
      q("hs-cpp-memory-leak", "intermediate", true, "线上内存持续上涨，你怎么区分泄漏和正常缓存增长？", ["内存上涨", "泄漏", "排查"], [
        "先看是否有上限、是否与流量/业务峰值相关、重启后是否可复现。",
        "缓存增长通常可解释且可配置上限；泄漏往往与对象生命周期错误相关。",
        "再用对象计数、ASan/heap profile、模块开关做二分定位。",
        "交易系统里还要警惕“状态机未完结导致对象滞留”这类业务型泄漏。"
      ]),
      q("hs-cpp-perf-tune", "advanced", true, "你做过或会怎么做 C++ 服务性能调优？", ["性能调优", "profiling", "加分"], [
        "先定指标：延迟分位、吞吐、CPU、尾延迟，而不是只看平均值。",
        "用 perf/火焰图找热点，区分计算、锁竞争、分配、系统调用。",
        "再针对性改：数据结构、批处理、无锁/细粒度锁、减少拷贝、绑核等。",
        "每次改动都要回归正确性，交易系统绝不能用正确性换账面性能。"
      ]),
      q("hs-cpp-false-sharing", "advanced", false, "什么是伪共享？为什么多线程计数/状态字段要小心？", ["伪共享", "缓存行", "并发"], [
        "不同线程频繁写同一缓存行上的不同变量时，会触发缓存行来回失效。",
        "表现像锁竞争一样把 CPU 打满，但代码里可能根本没有显式锁。",
        "缓解方式包括按缓存行对齐隔离、减少共享写、改成线程本地聚合再汇总。",
        "这是性能加分题，能讲清现象和定位思路就很加分。"
      ]),
      q("hs-cpp-alignment", "intermediate", true, "内存对齐是怎么回事？结构体成员顺序为什么会影响大小？", ["内存对齐", "padding", "结构体"], [
        "CPU 读内存是按固定宽度成块搬运的，地址对齐时一次就能取到，不对齐就要取两次再拼接，所以硬件和编译器都倾向于对齐。",
        "每个成员按自身大小对齐，结构体整体再按最大成员对齐，编译器会在中间和末尾插入 padding 补齐。",
        "同样的字段，char/int/char 的排列可能占 12 字节，而 int/char/char 只占 8 字节，差别就来自 padding。",
        "实践上把大成员放前面、小成员集中放后面，能明显缩小结构体；结构体变小意味着一个缓存行能装下更多元素，命中率更高。",
        "可以用 alignas 显式指定对齐，用 offsetof 和 sizeof 验证实际布局，不要靠猜。"
      ]),
      q("hs-cpp-memory-pool", "advanced", true, "为什么交易系统热路径常自己做内存池？怎么实现？", ["内存池", "分配器", "低延迟"], [
        "通用 malloc 要处理任意大小、多线程竞争和碎片，路径长且延迟不稳定，这种抖动在低延迟场景不可接受。",
        "内存池的思路是启动时一次性向系统要一大块，之后在这块里按固定大小切分，分配和回收都变成链表摘挂，是常数时间。",
        "常用侵入式空闲链表：空闲块本身的前几个字节就存下一个空闲块的地址，不需要额外的管理内存。",
        "对象构造用 placement new 在已有内存上构造，析构时显式调用析构函数再把块还回链表，注意这时不能用 delete。",
        "还要考虑多线程：每个线程一个本地池可以完全避免锁竞争，代价是内存利用率下降，需要按业务权衡。"
      ]),
      q("hs-cpp-stl-choice", "intermediate", true, "vector、list、map、unordered_map 在热路径上怎么选？", ["STL", "容器选型", "缓存"], [
        "先看复杂度，但更要看缓存友好度，实际性能经常和纸面复杂度不一致。",
        "vector 内存连续，遍历时缓存命中率极高，绝大多数场景应该是默认选择；缺点是中间插入删除是 O(n)，扩容会导致迭代器失效。",
        "list 的插入删除是 O(1)，但每个节点单独分配、内存分散，遍历时几乎每次都 cache miss，实际上很少比 vector 快。",
        "map 是红黑树，有序、稳定 O(log n)，插入不会让已有迭代器失效；unordered_map 平均 O(1) 但常数更大、内存更散，且 rehash 会让迭代器失效。",
        "元素少的时候（几十个以内），排序的 vector 加二分往往比 map 和 unordered_map 都快，因为它对缓存最友好。"
      ])
    ],
    "恒生 / Linux与调试": [
      q("hs-linux-commands", "basic", true, "排查 Linux 服务端问题时，你常用哪些命令？", ["Linux", "命令", "排障"], [
        "进程与资源：ps/top/htop、pidstat、free、vmstat、iostat。",
        "网络与连接：ss/netstat、tcpdump、curl；文件与句柄：lsof、df、du。",
        "日志与文本：journalctl/tail/grep/awk；性能：perf、strace。",
        "关键不是背清单，而是能按“CPU/内存/IO/网络/锁”分类选用。"
      ]),
      q("hs-linux-gdb-base", "basic", true, "gdb 里你最常用的调试动作有哪些？", ["gdb", "调试"], [
        "启动/附加进程、下断点、查看调用栈 backtrace、打印变量与内存。",
        "单步/下一步、条件断点、观察点，用于定位偶发路径。",
        "多线程场景下用 info threads、thread apply all bt 看各线程栈。",
        "线上常结合 core dump：ulimit -c、分析崩溃栈比现场盲猜更高效。"
      ]),
      q("hs-linux-core-dump", "intermediate", true, "服务崩溃后你如何用 core 快速定位？", ["core dump", "崩溃", "gdb"], [
        "先确认是否生成 core，以及二进制与符号表版本是否匹配。",
        "用 gdb 加载可执行文件和 core，看崩溃线程栈与寄存器。",
        "判断是空指针、二次释放、栈溢出还是断言失败，再回看变更点。",
        "同时保留复现输入与日志时间线，避免只盯着最终崩溃点。"
      ]),
      q("hs-linux-server-exp", "intermediate", true, "你理解的 Linux 服务端开发经验包含哪些能力？", ["Linux 服务端", "加分"], [
        "进程守护、配置热更边界、日志规范、信号处理与优雅退出。",
        "socket 编程、线程模型、资源限制（fd/内存/文件数）与监控埋点。",
        "线上排障：能从现象定位到模块，而不是只会本地跑通 demo。",
        "对交易系统还要强调：发布回滚、灰度与故障演练意识。"
      ]),
      q("hs-linux-cpu-high", "intermediate", true, "进程 CPU 持续很高，你怎么查？", ["CPU 高", "perf", "排查"], [
        "先确认是用户态还是内核态忙，以及是单核打满还是整体高。",
        "用 top/pidstat 找线程，再用 perf top/火焰图看热点函数。",
        "区分忙循环、锁竞争、频繁系统调用、异常重试等不同因。",
        "改之前先留基线，改之后对比延迟与正确性，避免误优化。"
      ]),
      q("hs-linux-fd-leak", "intermediate", false, "如何判断并排查文件描述符泄漏？", ["fd", "lsof", "泄漏"], [
        "现象常是 accept/open 失败、errno=EMFILE/ENFILE，或 fd 数持续上涨。",
        "用 lsof -p、/proc/<pid>/fd 观察增长来源（socket/文件/管道）。",
        "代码侧检查异常路径是否漏 close，以及 RAII 封装是否完整。",
        "服务端里连接管理模块是高发区，要重点看超时回收。"
      ]),
      q("hs-linux-strace-perf", "advanced", false, "strace 和 perf 分别适合什么场景？", ["strace", "perf"], [
        "strace 适合看系统调用轨迹：阻塞在哪个 syscall、失败码是什么。",
        "perf 更适合 CPU 热点与采样分析，找用户态热点函数。",
        "高频路径上长期开 strace 开销大，定位后应及时关掉。",
        "组合用法：先定性资源类型，再选对工具深入。"
      ]),
      q("hs-linux-core-missing", "intermediate", true, "服务崩了却没有 core 文件，可能是什么原因？", ["core dump", "ulimit", "core_pattern"], [
        "先确认 ulimit -c 是不是 0，很多发行版默认就是 0，等于关掉了 core。",
        "再看 /proc/sys/kernel/core_pattern，如果被管道给了 systemd-coredump 或 apport，core 其实在别处，用 coredumpctl 取。",
        "程序如果调用过 setuid 或设置了权限位，内核默认不生成 core，需要打开 suid_dumpable。",
        "还要检查落盘目录是否存在、是否可写、磁盘是否已满，以及容器里是否共享了宿主机的 core_pattern。",
        "最后一种可能是根本没崩：被 kill -9 或 OOM Killer 杀掉不会产生 core，去 dmesg 里搜 Out of memory 就能确认。"
      ]),
      q("hs-linux-deadlock-live", "intermediate", true, "线上服务卡死不响应，你的排查步骤是什么？", ["死锁", "hang", "线程栈"], [
        "先看 CPU：占用低说明在等待，占用高说明在忙循环，两条路完全不同。",
        "等待类的第一步是拿全部线程栈，用 pstack pid 或 gdb -p pid -batch -ex \"thread apply all bt\" -ex detach，快进快出不影响服务。",
        "多个线程停在 pthread_mutex_lock 上就是锁等待，接着确认它们各自已持有哪把锁，出现交叉就是死锁。",
        "如果线程都停在 epoll_wait 或条件变量上，那不是死锁，要怀疑是漏了 notify，或者上游根本没来数据。",
        "还要排除卡在 read/write 的情况，那属于对端不回包或磁盘慢，是外部依赖问题。"
      ]),
      q("hs-linux-epoll-lt-et", "advanced", true, "epoll 的 LT 和 ET 有什么区别？内部结构是怎样的？", ["epoll", "LT", "ET"], [
        "epoll 内部主要是两部分：一棵红黑树保存所有被监听的 fd，一个就绪链表保存已经有事件的 fd。",
        "关键在于就绪不是靠轮询发现的，而是网卡中断触发内核回调，把 fd 主动挂到就绪链表上，所以 epoll_wait 的开销只和就绪数量有关，与总连接数无关。",
        "LT 是水平触发：只要缓冲区还有数据就会一直通知，编程简单容错性好，是默认模式。",
        "ET 是边缘触发：只在状态从无到有的那一刻通知一次，必须循环读到返回 EAGAIN 为止，否则剩下的数据就再也没人通知你了。",
        "ET 通常配非阻塞 fd 使用，减少了系统调用次数，但漏读一次就是连接卡死，属于典型的性能换复杂度。"
      ]),
      q("hs-linux-signal-safe", "advanced", false, "信号处理函数里为什么不能随便调用函数？正确写法是什么？", ["信号", "async-signal-safe", "优雅退出"], [
        "信号是异步打断：可能在任意一条指令之间插进来，包括在 malloc 正在维护内部链表的时候。",
        "如果此时处理函数里再调用 malloc 或 printf，就会重入同一把内部锁，导致死锁或数据结构损坏，所以只能调用异步信号安全的函数。",
        "最稳的写法是处理函数里只做一件极简的事：给一个 volatile sig_atomic_t 标志位赋值，或者往管道写一个字节，真正的处理放回主循环。",
        "更现代的做法是 signalfd 或自管道技巧，把信号转成一个可读的 fd，直接交给 epoll 统一处理，彻底避免异步上下文。",
        "注册时优先用 sigaction 而不是 signal，因为 signal 的行为在不同平台上不一致，而 sigaction 能明确指定掩码和 SA_RESTART。"
      ]),
      q("hs-linux-oom", "advanced", false, "OOM Killer 是怎么选中进程的？怎么避免自己被杀？", ["OOM", "overcommit", "内存"], [
        "Linux 默认允许 overcommit，也就是承诺的内存可以超过物理内存，因为大多数程序申请了并不会全用。",
        "真正分配物理页是在第一次写入触发缺页时，所以 malloc 成功不代表内存真的到手了。",
        "当物理内存和 swap 都不够时，内核会挑一个进程杀掉，评分主要看实际占用的内存量，占得多的最先被选中。",
        "可以通过 /proc/pid/oom_score_adj 调低关键进程的分数，让它更不容易被选中，但这只是相对优先级，不是免死金牌。",
        "被 OOM Killer 杀掉是 SIGKILL，不会产生 core、也没有任何清理机会，只能去 dmesg 里找 Out of memory 记录确认。"
      ]),
      q("hs-linux-sanitizer-choice", "intermediate", true, "ASan、TSan、valgrind 你会怎么选？", ["sanitizer", "valgrind", "工具选型"], [
        "第一判据是能不能重新编译：能重编优先 Sanitizer，只有二进制时才用 valgrind。",
        "ASan 查越界、use-after-free、double free 和泄漏，慢约 2 倍，适合开发和 CI 常开。",
        "TSan 专查数据竞争，慢 5 到 15 倍，只适合单独一条 CI 流水线或压测环境，而且不能和 ASan 同时开。",
        "valgrind 不用重编、还能查未初始化变量，但慢 10 到 50 倍，且查不到栈上越界。",
        "工程上的组合是：日常构建挂 ASan+UBSan，CI 另跑一条 TSan，线上出事再用 valgrind 或 core 救场。"
      ])
    ],
    "恒生 / 并发与进程": [
      q("hs-conc-process-thread", "basic", true, "进程和线程的核心区别是什么？交易服务里怎么选？", ["进程", "线程", "模型"], [
        "进程地址空间隔离更强，崩溃影响面相对可控；线程共享内存，通信成本更低。",
        "交易系统常混合：多进程隔离模块/实例，进程内多线程分担 IO 与计算。",
        "选型看故障隔离、延迟、开发复杂度与运维部署方式。",
        "没有银弹，要能讲清你当前系统的约束再给方案。"
      ]),
      q("hs-conc-sync", "basic", true, "多线程里常见同步手段有哪些？如何取舍？", ["互斥锁", "条件变量", "原子"], [
        "mutex 保护临界区，condition variable 做等待通知，atomic 做轻量共享状态。",
        "锁粒度太粗会串行化，太细又容易死锁和复杂度爆炸。",
        "能无锁/无共享就无共享；共享状态尽量缩小并明确不变式。",
        "面试最好强调：正确性优先，再用测量决定是否上更激进的并发结构。"
      ]),
      q("hs-conc-race", "intermediate", true, "数据竞争和竞态条件有什么区别？", ["数据竞争", "竞态", "线程安全"], [
        "数据竞争通常指多线程无同步地同时访问同一内存且至少一方写入。",
        "竞态条件更广，指结果依赖时机/交织，即使没有未定义的数据竞争也可能逻辑错。",
        "C++ 里数据竞争属于未定义行为，必须消灭。",
        "排查可用 TSan、复现脚本和不变式断言。"
      ]),
      q("hs-conc-deadlock", "intermediate", true, "如何预防和排查死锁？", ["死锁", "锁顺序"], [
        "预防：统一锁顺序、缩小临界区、避免嵌套锁、用超时锁或层级锁策略。",
        "排查：抓线程栈，看互相等待的锁；对照锁获取顺序找环。",
        "工程上可对关键锁做持有时间监控，发现异常长时间持锁。",
        "交易链路更怕偶发死锁，所以要有回归场景覆盖异常路径。"
      ]),
      q("hs-conc-producer-consumer", "intermediate", true, "交易网关里生产者-消费者队列要注意什么？", ["队列", "背压", "并发"], [
        "明确容量与背压：队列满时是阻塞、丢弃、还是降级，必须有策略。",
        "注意伪共享、批量弹出、内存分配，避免队列本身成为热点。",
        "保证消息顺序语义是否需要按账户/连接保序。",
        "还要处理消费者崩溃后的重放/幂等，不能假设一定只消费一次。"
      ]),
      q("hs-conc-atomic-vs-mutex", "intermediate", true, "什么时候用 atomic，什么时候必须上锁？", ["atomic", "mutex"], [
        "单变量状态切换、计数器、标志位，atomic 往往足够且更轻。",
        "一旦涉及多字段不变量或复杂读写协议，通常需要 mutex 保护整体。",
        "错误用法是用多个 atomic 拼出“看起来原子”的业务操作。",
        "原则：保护的是不变量，不只是单个变量。"
      ]),
      q("hs-conc-thread-pool", "advanced", false, "线程池在低延迟系统里可能有哪些坑？", ["线程池", "低延迟"], [
        "任务排队会引入尾延迟；线程过多导致切换和缓存失效。",
        "任务若阻塞在锁或 IO，会占满工作线程引发雪崩。",
        "需要区分关键路径线程与后台任务线程，避免互相抢占。",
        "交易系统常对关键路径做专用线程/绑核，而不是一股脑丢进通用池。"
      ])
    ],
    "恒生 / 数据库基础": [
      q("hs-db-acid", "basic", true, "事务的 ACID 分别保证什么？和交易记账有什么关系？", ["事务", "ACID", "记账"], [
        "原子性保证一组操作要么全成要么全不成；一致性保证约束不被破坏。",
        "隔离性控制并发事务互相影响；持久性保证提交后不丢。",
        "交易记账最怕“扣款成功但持仓没更新”这类半成功，所以事务语义很关键。",
        "即使核心在内存，落库/落日志时仍要清楚事务边界。"
      ]),
      q("hs-db-isolation", "intermediate", true, "常见隔离级别以及脏读/不可重复读/幻读？", ["隔离级别", "脏读", "幻读"], [
        "读未提交可能脏读；读已提交避免脏读；可重复读缓解不可重复读；串行化最强。",
        "不同数据库对可重复读是否完全避免幻读实现不同，答题时点明这一点更稳。",
        "隔离越高并发性能通常越差，要按业务容忍度选择。",
        "交易场景里对资金持仓一致性要求高，不能只追求吞吐。"
      ]),
      q("hs-db-index", "basic", true, "索引的作用是什么？什么情况下索引会帮倒忙？", ["索引", "查询", "写入"], [
        "索引加速查找与排序，本质是用额外结构换查询时间。",
        "写多、更新频繁、选择性很差的字段上滥建索引，会拖慢写入并浪费空间。",
        "联合索引要注意最左前缀，避免建了却用不上。",
        "先用慢查询和执行计划判断，再决定加不加索引。"
      ]),
      q("hs-db-index-tradeoff", "intermediate", true, "交易系统里如何看待“内存态数据”和“数据库索引”的关系？", ["内存", "数据库", "索引"], [
        "热路径可能主要走内存结构；数据库更偏持久化、查询、清算与运维分析。",
        "内存结构也有“索引”思想：哈希、有序树、按账户分片等。",
        "关键是明确哪一层是 source of truth，以及崩溃恢复如何重建内存态。",
        "不要把磁盘库的索引优化经验原样套到超低延迟热路径上。"
      ]),
      q("hs-db-idempotent", "intermediate", true, "回报重入或消息重复时，如何保证记账幂等？", ["幂等", "重复消息", "一致性"], [
        "为每笔委托/成交设计唯一业务键，写入前先查重。",
        "状态机只允许合法迁移，重复回报落到同一终态不产生二次副作用。",
        "必要时用事务或预写日志保证“查重 + 记账”原子完成。",
        "这是交易系统高频考点，能讲清比背 SQL 更重要。"
      ]),
      q("hs-db-txn-fail", "intermediate", false, "事务执行失败时，你如何设计补偿或回滚策略？", ["回滚", "补偿", "失败处理"], [
        "单库本地事务优先靠数据库回滚；跨系统则需要补偿事务或可靠消息。",
        "明确哪些步骤可重试、哪些必须人工介入，避免自动乱补。",
        "记录足够审计信息，保证资金与持仓可对账。",
        "面试强调：先定义失败语义，再写代码路径。"
      ])
    ],
    "恒生 / 系统设计": [
      q("hs-design-module", "intermediate", true, "拿到一个交易功能模块，你会怎么做方案设计？", ["模块设计", "方案", "系统设计"], [
        "先澄清输入输出、状态机、非功能指标（延迟、吞吐、可用性）和失败模式。",
        "再拆接口、数据模型、并发模型、持久化与观测点。",
        "给出风险点和验证方式：单测、回放、压测、对账。",
        "表达结构比堆技术词更重要：背景 → 方案 → 取舍 → 验证。"
      ]),
      q("hs-design-arch", "intermediate", true, "全内存交易系统架构上，你觉得要重点讲清哪些点？", ["架构", "全内存", "可靠性"], [
        "热数据如何组织与分片，关键路径如何避免锁与 IO。",
        "持久化与恢复：日志、快照、启动回放如何保证不丢不乱。",
        "容灾与切换：主备、会话迁移、脑裂防护。",
        "监控告警与容量规划，保证“快”的同时可运营。"
      ]),
      q("hs-design-debug", "intermediate", true, "线上偶发错单或状态不一致，你怎么排查？", ["排查", "对账", "状态机"], [
        "先固定样本：委托号、时间线、期望状态与实际状态。",
        "串起日志、回报序列、数据库/内存快照，找第一处分叉。",
        "判断是重复回报、乱序、并发写、还是规则配置问题。",
        "修复后补回归用例与对账校验，防止同类问题复发。"
      ]),
      q("hs-design-unittest", "basic", true, "交易模块单测你觉得应该覆盖哪些？", ["单元测试", "状态机", "边界"], [
        "正常下单成交路径，以及拒单、部成、撤单、超时等状态迁移。",
        "重复回报、乱序回报、幂等冲突等异常输入。",
        "边界金额/数量、精度、权限与风控拒绝。",
        "单测价值是把业务规则变成可重复执行的安全网。"
      ]),
      q("hs-design-latency", "advanced", true, "如何系统化降低交易链路延迟？", ["低延迟", "性能", "架构"], [
        "画清关键路径，去掉同步磁盘、多余拷贝、跨进程跳转。",
        "批处理与流水线、亲和性绑核、减少锁竞争与系统调用。",
        "用分位延迟和压测回归，而不是只看实验室平均值。",
        "任何优化都要有正确性门禁，尤其是记账与顺序语义。"
      ]),
      q("hs-design-communicate", "basic", true, "和产品/业务同事对齐需求时，你怎么保证设计不跑偏？", ["沟通", "业务设计", "需求"], [
        "把口头需求落成用例：正常流、异常流、验收口径。",
        "明确哪些规则可配置、哪些必须代码固化，以及上线风险。",
        "用状态图或时序图对齐，减少“同词不同义”。",
        "JD 强调愿意钻研业务并完成业务设计，这正是体现点。"
      ]),
      q("hs-design-owner", "basic", true, "逐步承担模块负责人时，你如何体现责任心与抗压？", ["责任心", "抗压", "协作"], [
        "对线上问题有 owner 意识：跟进到根因、修复、回归与复盘。",
        "压力下来时先止血再根治，沟通进展而不是沉默硬扛。",
        "把个人经验沉淀成文档、用例和监控，降低团队重复踩坑。",
        "面试用具体事例说明，比空喊态度更有说服力。"
      ])
    ]
  };

  const questions = Object.keys(questionGroups).flatMap(function (category) {
    return questionGroups[category].map(function (item) {
      return {
        id: item.id,
        category: category,
        difficulty: item.difficulty,
        highFrequency: item.highFrequency,
        question: item.question,
        keywords: item.keywords,
        answerPoints: item.answerPoints,
        diagramSteps: item.diagramSteps,
        pitfalls: item.pitfalls,
        cppCode: item.cppCode,
        complexity: item.complexity
      };
    });
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { questions: questions };
  }

  globalScope.INTERVIEW_QUESTIONS = questions;
})(typeof window !== "undefined" ? window : globalThis);
