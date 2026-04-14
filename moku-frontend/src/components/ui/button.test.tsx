import { expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { Button } from './button'

test('renders button with text', async () => {
    const { getByText } = await render(<Button>Click me</Button>)
    await expect.element(getByText('Click me')).toBeInTheDocument()
})

test('handles click event', async () => {
    const handleClick = vi.fn()
    const { getByText } = await render(<Button onClick={handleClick}>Click me</Button>)

    await getByText('Click me').click()
    expect(handleClick).toHaveBeenCalled()
})

test('renders disabled button', async () => {
    const { getByText } = await render(<Button disabled>Disabled</Button>)
    const button = getByText('Disabled')

    await expect.element(button).toBeDisabled()
})

test('applies variant classes', async () => {
    const { getByText } = await render(<Button variant="danger">Delete</Button>)
    const button = getByText('Delete')

    // Checking for a class that is specific to the danger variant
    await expect.element(button).toHaveClass('bg-dark-red')
})
