FROM mcr.microsoft.com/dotnet/runtime:5.0-alpine AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:5.0-alpine AS build
WORKDIR /src
COPY TeardownBot/TeardownBot.csproj TeardownBot/
COPY TeardownBot/NuGet.Config .
RUN dotnet restore "TeardownBot/TeardownBot.csproj"
COPY . .
WORKDIR "/src/TeardownBot"
RUN dotnet build "TeardownBot.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TeardownBot.csproj" -c Release -o /app/publish

FROM base AS final
COPY config.json /app
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TeardownBot.dll"]
