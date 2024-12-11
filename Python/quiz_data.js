const questions = [
	{
	  	question: `What does the following code output?
  
  		\`\`\`python
  		def greet():
	  		print("Hello, world!")
  
  		greet()
  		\`\`\`
  		`,
	  	options: [
			'`Hello, world!`',
			'`An error message`',
			'`Nothing`',
			'`greet`',
	  	],
	  	answer: 0,
	  	tags: ['Python', 'Functions'],
	},
	{
		question: `Which of the following code snippets correctly uses Python's metaclasses or class features to automatically register all subclasses of a base class into a registry dictionary?`,
		options: [
			`
			\`\`\`python
			registry = {}

			class Meta(type):
				def __new__(mcs, name, bases, attrs):
					cls = super().__new__(mcs, name, bases, attrs)
					registry[name] = cls
					return cls

			class Base(metaclass=Meta):
				pass
			\`\`\`
			`,
			`
			\`\`\`python
			registry = {}

			class Base:
				def __init_subclass__(cls, **kwargs):
					super().__init_subclass__(**kwargs)
					registry[cls.__name__] = cls
			\`\`\`
			`,
			`
			\`\`\`python
			registry = {}

			def register_class(cls):
				registry[cls.__name__] = cls
				return cls

			class Base:
				pass

			@register_class
			class Derived(Base):
				pass
			\`\`\`
			`,
			`
			\`\`\`python
			registry = {}

			class Meta(type):
				def __call__(cls, *args, **kwargs):
					instance = super().__call__(*args, **kwargs)
					registry[cls.__name__] = instance
					return instance

			class Base(metaclass=Meta):
				pass
			\`\`\`
			`,
		]
	}
];
  
export default questions;