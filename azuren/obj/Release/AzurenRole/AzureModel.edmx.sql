
-- --------------------------------------------------
-- Entity Designer DDL Script for SQL Server 2005, 2008, and Azure
-- --------------------------------------------------
-- Date Created: 08/13/2013 16:11:57
-- Generated from EDMX file: F:\Workspace\azuren\AzurenRole\AzureModel.edmx
-- --------------------------------------------------

SET QUOTED_IDENTIFIER OFF;
GO
USE [azuren];
GO
IF SCHEMA_ID(N'dbo') IS NULL EXECUTE(N'CREATE SCHEMA [dbo]');
GO

-- --------------------------------------------------
-- Dropping existing FOREIGN KEY constraints
-- --------------------------------------------------


-- --------------------------------------------------
-- Dropping existing tables
-- --------------------------------------------------

IF OBJECT_ID(N'[dbo].[Apps]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Apps];
GO
IF OBJECT_ID(N'[dbo].[Users]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Users];
GO

-- --------------------------------------------------
-- Creating all tables
-- --------------------------------------------------

-- Creating table 'Users'
CREATE TABLE [dbo].[Users] (
    [id] int IDENTITY(1,1) NOT NULL,
    [username] varchar(20)  NOT NULL,
    [displayname] varchar(20)  NOT NULL,
    [password] varchar(40)  NOT NULL
);
GO

-- Creating table 'Apps'
CREATE TABLE [dbo].[Apps] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Name] nvarchar(20)  NULL,
    [Url] nvarchar(255)  NULL,
    [Icon] nvarchar(255)  NULL,
    [Secret] nvarchar(40)  NULL,
    [Status] nvarchar(10)  NULL,
    [Desc] nvarchar(max)  NULL
);
GO

-- Creating table 'UserApp'
CREATE TABLE [dbo].[UserApp] (
    [Users_id] int  NOT NULL,
    [Apps_Id] int  NOT NULL
);
GO

-- --------------------------------------------------
-- Creating all PRIMARY KEY constraints
-- --------------------------------------------------

-- Creating primary key on [id] in table 'Users'
ALTER TABLE [dbo].[Users]
ADD CONSTRAINT [PK_Users]
    PRIMARY KEY CLUSTERED ([id] ASC);
GO

-- Creating primary key on [Id] in table 'Apps'
ALTER TABLE [dbo].[Apps]
ADD CONSTRAINT [PK_Apps]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Users_id], [Apps_Id] in table 'UserApp'
ALTER TABLE [dbo].[UserApp]
ADD CONSTRAINT [PK_UserApp]
    PRIMARY KEY NONCLUSTERED ([Users_id], [Apps_Id] ASC);
GO

-- --------------------------------------------------
-- Creating all FOREIGN KEY constraints
-- --------------------------------------------------

-- Creating foreign key on [Users_id] in table 'UserApp'
ALTER TABLE [dbo].[UserApp]
ADD CONSTRAINT [FK_UserApp_User]
    FOREIGN KEY ([Users_id])
    REFERENCES [dbo].[Users]
        ([id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating foreign key on [Apps_Id] in table 'UserApp'
ALTER TABLE [dbo].[UserApp]
ADD CONSTRAINT [FK_UserApp_App]
    FOREIGN KEY ([Apps_Id])
    REFERENCES [dbo].[Apps]
        ([Id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Creating non-clustered index for FOREIGN KEY 'FK_UserApp_App'
CREATE INDEX [IX_FK_UserApp_App]
ON [dbo].[UserApp]
    ([Apps_Id]);
GO

-- --------------------------------------------------
-- Script has ended
-- --------------------------------------------------