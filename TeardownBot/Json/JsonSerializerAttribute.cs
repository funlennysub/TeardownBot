using System;
using JetBrains.Annotations;

namespace TeardownBot.Json
{
  /// <summary>
  /// Атрибут указывает, что класс является JSON сериализатором, и кладет его в список сериализаторов параметров сериализации JSON по умолчанию
  /// В случаях, когда сериализатор имеет генерик-аргументы - <see cref="IJsonSerializerList"/>
  /// </summary>
  [MeansImplicitUse]
  [AttributeUsage(AttributeTargets.Class)]
  public class JsonSerializerAttribute : Attribute
  {
        
  }

}