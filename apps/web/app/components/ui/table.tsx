import * as React from 'react'

import { cn } from '#app/utils/misc'

function Table({ className, ...props }: React.ComponentProps<'table'>) {
	return (
		<div className="overflow-hidden rounded-xl bg-card ring-1 ring-border shadow-sm">
			<div className="relative w-full overflow-x-auto">
				<table
					className={cn('w-full', className)}
					{...props}
				/>
			</div>
		</div>
	)
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
	return (
		<thead
			className={cn('bg-muted/30', className)}
			{...props}
		/>
	)
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
	return (
		<tbody
			className={cn('', className)}
			{...props}
		/>
	)
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
	return (
		<tfoot
			className={cn('bg-muted/30 border-t border-border/50', className)}
			{...props}
		/>
	)
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
	return (
		<tr
			className={cn('hover:bg-muted/40 transition-colors border-b border-border/20 last:border-b-0', className)}
			{...props}
		/>
	)
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
	return (
		<th
			className={cn(
				'overflow-hidden text-left text-xs font-medium text-muted-foreground px-6 pb-3.5 pt-4 [&:has([data-table-sort])_[data-table-sort-spacer]]:hidden [&_[data-table-sort-spacer]]:hidden',
				className,
			)}
			{...props}
		/>
	)
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
	return (
		<td
			className={cn(
				'px-6 py-2 text-left text-sm text-foreground bg-card',
				className,
			)}
			{...props}
		/>
	)
}

function TableCaption({
	className,
	...props
}: React.ComponentProps<'caption'>) {
	return (
		<caption
			className={cn('mt-4 text-sm text-muted-foreground', className)}
			{...props}
		/>
	)
}

export {
	Table,
	TableHeader,
	TableBody,
	TableFooter,
	TableHead,
	TableRow,
	TableCell,
	TableCaption,
}
