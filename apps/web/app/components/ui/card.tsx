import * as React from 'react'

import { cn } from '#app/utils/misc'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<section
			data-slot="card"
			className={cn(
				'group flex flex-col rounded-2xl py-1 bg-muted/50',
				className,
			)}
			{...props}
		/>
	)
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<header
			data-slot="card-header"
			className={cn(
				'flex flex-col flex-wrap px-6 py-4',
				className,
			)}
			{...props}
		/>
	)
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<h2
			data-slot="card-title"
			className={cn('flex flex-wrap items-center gap-x-2 gap-y-0.5 text-card-foreground font-medium', className)}
			{...props}
		/>
	)
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<p
			data-slot="card-description"
			className={cn('mt-0.5 text-pretty text-sm text-muted-foreground', className)}
			{...props}
		/>
	)
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-action"
			className={cn(
				'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
				className,
			)}
			{...props}
		/>
	)
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-content"
			className={cn('overflow-hidden rounded-xl bg-card mx-1 ring-1 ring-border shadow-sm p-6', className)}
			{...props}
		/>
	)
}

function CardBody({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-body"
			className={cn('space-y-6 border-t border-border first:border-none p-5.5', className)}
			{...props}
		/>
	)
}

function CardHeaderContent({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-header-content"
			className={cn('flex-1', className)}
			{...props}
		/>
	)
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<footer
			data-slot="card-footer"
			className={cn('flex px-5 py-2', className)}
			{...props}
		/>
	)
}

export {
	Card,
	CardHeader,
	CardHeaderContent,
	CardFooter,
	CardTitle,
	CardAction,
	CardDescription,
	CardContent,
	CardBody,
}
